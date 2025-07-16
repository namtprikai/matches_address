import json
from typing import Any, Dict, Optional, List, Union
import zlib

from FN015.models.trie.char_node import CharNode


def crc32_from_string(s: str) -> str:
    return format(zlib.crc32(s.encode('utf-8')) & 0xffffffff, '08x')

class TrieFinderResult:
    def __init__(self, info, unmatched, depth, ambiguousCnt, path):
        self.info = info
        self.unmatched = unmatched
        self.depth = depth
        self.ambiguousCnt = ambiguousCnt
        self.path = path

class TrieAddressFinder:
    def __init__(self):
        self.root = self.create_trie_node()
        self.items: Dict[str, Any] = {}

    def create_trie_node(self):
        return {'itemHashes': None, 'children': {}}

    def export_(self) -> bytes:
        return json.dumps({'tree': self.root, 'items': self.items}).encode('utf-8')

    def import_(self, data: bytes):
        results = json.loads(data.decode('utf-8'))
        self.root = results['tree']
        self.items = results['items']

    def append(self, key: Union[str, int, CharNode], value: Any):
        parent = self.root
        if isinstance(key, CharNode):
            head = key
            while head:
                trie = parent['children'].get(head.char) or self.create_trie_node()
                parent['children'][head.char] = trie
                parent = trie
                head = head.next
        else:
            for char in str(key):
                trie = parent['children'].get(char) or self.create_trie_node()
                parent['children'][char] = trie
                parent = trie
        item_hash = self.to_item_hash({**value, 'key': None} if isinstance(value, dict) else value)
        if item_hash not in self.items:
            self.items[item_hash] = value
        if parent['itemHashes'] is None:
            parent['itemHashes'] = set()
        parent['itemHashes'].add(item_hash)

    def to_item_hash(self, value: Any) -> str:
        return crc32_from_string(json.dumps(value, sort_keys=True, ensure_ascii=False))

    def find(self, target: CharNode, fuzzy: Optional[str] = None, partialMatches: bool = False, extraChallenges: Optional[List[str]] = None) -> List[TrieFinderResult]:
        node = target.move_to_next() if target else None
        search_results = self.traverse(
            parent=self.root,
            node=node,
            partialMatches=partialMatches,
            extraChallenges=extraChallenges,
            fuzzy=fuzzy,
            depth=0,
            path='',
        )
        if not search_results or len(search_results) == 0:
            return []
        results = []
        for internal_result in search_results.values():
            if internal_result['depth'] == 0:
                continue
            results.append(TrieFinderResult(
                info=internal_result['info'],
                unmatched=internal_result['unmatched'],
                depth=internal_result['depth'],
                ambiguousCnt=1 if internal_result.get('ambiguous') else 0,
                path=CharNode.create(internal_result['path']) if 'path' in internal_result else None
            ))
        return results

    def traverse(self, parent, node, partialMatches, extraChallenges, fuzzy, depth, path):
        # ignoreフラグが指定されている場合、スキップする
        if node and getattr(node, 'ignore', False):
            node = node.move_to_next()
            return self.traverse(parent, node, partialMatches, extraChallenges, fuzzy, depth, path)
        if not parent:
            return None
        if node and getattr(node, 'char', None) and node.char in parent['children']:
            parent2 = parent['children'][node.char]
            others = self.traverse(
                parent2,
                node.next,
                partialMatches,
                extraChallenges,
                fuzzy,
                depth + 1,
                path + node.char
            ) or {}
            if not partialMatches:
                return others
            # 中間結果を含む場合
            if parent.get('itemHashes'):
                for item_hash in parent['itemHashes']:
                    if item_hash in others:
                        continue
                    others[item_hash] = {
                        'info': self.items.get(item_hash),
                        'unmatched': node,
                        'depth': depth,
                        'ambiguous': False,
                    }
            return others
        # fuzzyが来た場合、全ての可能性を探索する
        if node and node.char == fuzzy:
            results = {}
            for child in parent['children'].values():
                others = self.traverse(child, node.next, partialMatches, extraChallenges, fuzzy, depth + 1, path + node.char)
                if others:
                    for item_hash, other in others.items():
                        if item_hash in results:
                            continue
                        if other['unmatched'] and getattr(other['unmatched'], 'char', None) == fuzzy:
                            other['unmatched'] = other['unmatched'].next
                        other['ambiguous'] = True
                        results[item_hash] = other
            if parent.get('itemHashes'):
                for item_hash in parent['itemHashes']:
                    if item_hash in results:
                        continue
                    results[item_hash] = {
                        'info': self.items.get(item_hash),
                        'unmatched': node,
                        'depth': depth,
                        'ambiguous': False,
                        'path': path,
                    }
            return results
        # これ以上探索する文字がない場合は現時点の情報を返す
        results = {}
        if parent.get('itemHashes'):
            for item_hash in parent['itemHashes']:
                results[item_hash] = {
                    'info': self.items.get(item_hash),
                    'unmatched': node,
                    'depth': depth,
                    'ambiguous': False,
                    'path': path,
                }
            return results
        # extraChallenges が指定されている場合、もう１文字を試してみる
        if depth > 0 and extraChallenges:
            for extraWord in extraChallenges:
                if not parent['children'].get(extraWord[0] if extraWord else '') or (extraWord and extraWord[0] == getattr(node, 'char', None)):
                    continue
                newChallenges = []
                if len(extraWord) > 1:
                    newChallenges.append(extraWord[1:])
                others = self.traverse(
                    parent['children'][extraWord[0]],
                    node,
                    partialMatches,
                    newChallenges if newChallenges else None,
                    fuzzy,
                    depth + 1,
                    path + (extraWord[0] if extraWord else '')
                )
                if others:
                    for item_hash, other in others.items():
                        if item_hash in results:
                            continue
                        other['ambiguous'] = True
                        results[item_hash] = other
        return results 