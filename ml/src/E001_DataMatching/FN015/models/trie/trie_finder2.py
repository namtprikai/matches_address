import struct
import zlib
import json
from collections import deque

from FN015.services.is_kanji_nums import is_kanji_nums
from FN015.services.is_number import is_digit
# Import constants from the shared abrg_file_structure.py
from FN015.models.trie.abrg_file_structure import (
    ABRG_FILE_HEADER_SIZE,
    ABRG_FILE_MAGIC,
    DATA_NODE_ENTRY_POINT,
    DATA_NODE_HASH_VALUE,
    DATA_NODE_NEXT_OFFSET,
    DATA_NODE_SIZE_FIELD,
    HASH_LINK_NODE_NEXT_OFFSET,
    HASH_LINK_NODE_OFFSET_VALUE,
    TRIE_NODE_CHILD_OFFSET,
    TRIE_NODE_ENTRY_POINT,
    TRIE_NODE_HASH_LINKED_LIST_OFFSET,
    TRIE_NODE_SIBLING_OFFSET,
    TRIE_NODE_SIZE_FIELD,
    VERSION_BYTES,
)
from FN015.models.trie.char_node import CharNode
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num


# Type definitions
class AbrgDictHeader:
    def __init__(self, version: dict, trie_node_offset: int, data_node_offset: int, header_size: int):
        self.version = version
        self.trie_node_offset = trie_node_offset
        self.data_node_offset = data_node_offset
        self.header_size = header_size


class DataNode:
    def __init__(self, data: bytes, node_size: int, hash_value: int, offset: int, next_data_node_offset: int,
                 next_node=None):
        self.data = data
        self.node_size = node_size
        self.hash_value = hash_value
        self.offset = offset
        self.next_data_node_offset = next_data_node_offset
        self.next = next_node


class TrieHashListNode:
    def __init__(self, hash_value_offset: int, offset: int, next_node: 'TrieHashListNode' = None):
        self.hash_value_offset = hash_value_offset
        self.offset = offset
        self.next = next_node


class ReadTrieNode:
    def __init__(self, name: str, offset: int, child_offset: int = None, sibling_offset: int = None,
                 hash_value_list: TrieHashListNode = None, node_size: int = 0):
        self.name = name
        self.offset = offset
        self.child_offset = child_offset
        self.sibling_offset = sibling_offset
        self.hash_value_list = hash_value_list
        self.node_size = node_size


class TrieFinderResult:
    def __init__(self, info: any, unmatched: CharNode, depth: int, ambiguous_cnt: int, path: CharNode):
        self.info = info
        self.unmatched = unmatched
        self.depth = depth
        self.ambiguous_cnt = ambiguous_cnt
        self.path = path


class TraverseQuery:
    def __init__(self, next_query: 'TraverseQuery' = None, target: CharNode = None, matched_cnt: int = 0,
                 ambiguous_cnt: int = 0, offset: int = None, hash_value_list: TrieHashListNode = None,
                 partial_matches: list = None, path: CharNode = None, allow_extra_challenge: bool = False):
        self.next = next_query
        self.target = target
        self.matched_cnt = matched_cnt
        self.ambiguous_cnt = ambiguous_cnt
        self.offset = offset
        self.hash_value_list = hash_value_list
        self.partial_matches = partial_matches if partial_matches is not None else []
        self.path = path
        self.allow_extra_challenge = allow_extra_challenge


class FileTrieResults:
    def __init__(self):
        self.holder: dict[int, TraverseQuery] = {}

    def add(self, value: TraverseQuery):
        if not value.hash_value_list:
            raise ValueError("value.hash_value_list must not be None")

        # Keep only the best result for a given hash_value_offset
        head: TrieHashListNode = value.hash_value_list
        while head:
            hash_offset = head.hash_value_offset
            before: TraverseQuery = self.holder.get(hash_offset)

            # Compare based on (matchedCnt - ambiguousCnt)
            if not before or (before.matched_cnt - before.ambiguous_cnt < value.matched_cnt - value.ambiguous_cnt):
                self.holder[hash_offset] = TraverseQuery(
                    target=value.target,
                    matched_cnt=value.matched_cnt,
                    ambiguous_cnt=value.ambiguous_cnt,
                    offset=value.offset,
                    hash_value_list=TrieHashListNode(hash_offset, value.offset),  # simplified to just offset and value
                    path=value.path,
                    next_query=None,
                    partial_matches=[],  # Ensure new object, not reference
                    allow_extra_challenge=False,  # Ensure new object, not reference
                )
            head = head.next

    def values(self):
        return self.holder.values()

    def clear(self):
        self.holder.clear()


class TrieAddressFinder2:
    def __init__(self, file_buffer: bytes):
        self.file_buffer = file_buffer
        self.debug = False
        self.header: AbrgDictHeader = self._read_header()
        if not self.header:
            if self.debug:
                print("Can not read the file")
            raise IOError("Can not read the file")

    def _read(self, offset: int, size: int) -> bytes:
        # Assumes file_buffer is already the full content
        return self.file_buffer[offset: offset + size]

    def _read_data_node(self, hash_value_offset: int, expect_hash_value: int = None) -> DataNode | None:
        current_offset = hash_value_offset

        # Next data node address
        next_data_node_offset = \
        struct.unpack('>I', self.file_buffer[current_offset: current_offset + DATA_NODE_NEXT_OFFSET.size])[0]
        current_offset += DATA_NODE_NEXT_OFFSET.size

        # Data node size
        node_size = struct.unpack('>H', self.file_buffer[current_offset: current_offset + DATA_NODE_SIZE_FIELD.size])[0]
        current_offset += DATA_NODE_SIZE_FIELD.size

        # Hash value for the data
        hash_value = struct.unpack('>Q', self.file_buffer[current_offset: current_offset + DATA_NODE_HASH_VALUE.size])[
            0]
        current_offset += DATA_NODE_HASH_VALUE.size

        if expect_hash_value is not None and expect_hash_value != hash_value:
            return None  # Data does not match expected hash for this chain

        result_data_bytes = b''
        # Actual data
        if current_offset < hash_value_offset + node_size:
            compressed_data = self.file_buffer[current_offset: hash_value_offset + node_size]
            try:
                result_data_bytes = zlib.decompress(compressed_data)
            except zlib.error as e:
                if self.debug:
                    print(f"Zlib decompression error: {e}")
                return None  # Or handle as corrupted data

        result_node = DataNode(
            data=result_data_bytes,
            node_size=node_size,
            hash_value=hash_value,
            offset=hash_value_offset,
            next_data_node_offset=next_data_node_offset,
        )

        # If there's a next node in the linked list (for hash collisions), read it recursively
        if next_data_node_offset > 0:
            result_node.next = self._read_data_node(next_data_node_offset, hash_value)

        return result_node

    def _read_header(self) -> AbrgDictHeader | None:
        # Read first 6 bytes
        first_6_bytes_buffer = self._read(0, ABRG_FILE_MAGIC.size + ABRG_FILE_HEADER_SIZE.size)

        # Check file magic (first 4 bytes)
        name = first_6_bytes_buffer[0: ABRG_FILE_MAGIC.size].decode('ascii')
        if name != 'abrg':
            return None

        # Header size
        header_size = struct.unpack('>H', first_6_bytes_buffer[
                                          ABRG_FILE_HEADER_SIZE.offset: ABRG_FILE_HEADER_SIZE.offset + ABRG_FILE_HEADER_SIZE.size])[
            0]

        # Read the entire header
        header_buffer = self._read(0, header_size)

        # Read version numbers
        major_version = struct.unpack('>B', header_buffer[VERSION_BYTES.offset: VERSION_BYTES.offset + 1])[0]
        minor_version = struct.unpack('>B', header_buffer[VERSION_BYTES.offset + 1: VERSION_BYTES.offset + 2])[0]

        # Version 2.2 or higher is supported
        if major_version != 2 or minor_version < 2:
            return None

        # Offset to trie tree node
        trie_node_offset = struct.unpack('>I', header_buffer[
                                               TRIE_NODE_ENTRY_POINT.offset: TRIE_NODE_ENTRY_POINT.offset + TRIE_NODE_ENTRY_POINT.size])[
            0]

        # Offset to data node
        data_node_offset = struct.unpack('>I', header_buffer[
                                               DATA_NODE_ENTRY_POINT.offset: DATA_NODE_ENTRY_POINT.offset + DATA_NODE_ENTRY_POINT.size])[
            0]

        return AbrgDictHeader(
            version={
                "major": major_version,
                "minor": minor_version,
            },
            trie_node_offset=trie_node_offset,
            data_node_offset=data_node_offset,
            header_size=header_size,
        )

    def _copy_to(self, offset: int, dst: bytearray):
        # copy from self.file_buffer to dst bytearray
        dst[:] = self.file_buffer[offset: offset + len(dst)]

    def _create_hash_value_list(self, node_offset: int) -> TrieHashListNode | None:
        head_value_list = TrieHashListNode(hash_value_offset=0, offset=0, next_node=None)
        tail_hash_value_list = head_value_list

        # Read the offset value to the data node linked to the trie node
        current_offset = struct.unpack('>I', self.file_buffer[
                                             node_offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset: node_offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.size])[
            0]

        if self.debug:
            print(f"(read){current_offset} at {node_offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset}")

        # Buffer to read the linked list of hash value offsets
        hash_link_node_buffer = bytearray(
            HASH_LINK_NODE_NEXT_OFFSET.size + HASH_LINK_NODE_OFFSET_VALUE.size
        )

        while current_offset > 0:
            # Read the hash link in the hash value offset linked list
            self._copy_to(current_offset, hash_link_node_buffer)

            # Next hash offset node offset
            next_offset = struct.unpack('>I', hash_link_node_buffer[
                                              HASH_LINK_NODE_NEXT_OFFSET.offset: HASH_LINK_NODE_NEXT_OFFSET.offset + HASH_LINK_NODE_NEXT_OFFSET.size])[
                0]
            # Saved hash value offset
            stored_hash_value_offset = struct.unpack('>I', hash_link_node_buffer[
                                                           HASH_LINK_NODE_OFFSET_VALUE.offset: HASH_LINK_NODE_OFFSET_VALUE.offset + HASH_LINK_NODE_OFFSET_VALUE.size])[
                0]

            # Create the list
            new_node = TrieHashListNode(
                hash_value_offset=stored_hash_value_offset,
                offset=current_offset,
                next_node=None,
            )
            tail_hash_value_list.next = new_node
            # No cache map used here as per TS original logic for this method
            tail_hash_value_list = new_node
            current_offset = next_offset

        return head_value_list.next

    def _read_trie_node(self, node_offset: int) -> ReadTrieNode | None:
        # Read node size (1 byte)
        node_size = struct.unpack('>B', self.file_buffer[
                                        node_offset + TRIE_NODE_SIZE_FIELD.offset: node_offset + TRIE_NODE_SIZE_FIELD.offset + TRIE_NODE_SIZE_FIELD.size])[
            0]

        # Read the entire node
        node_buffer = self._read(node_offset, node_size)

        # Offset within nodeBuffer for unpacking fields
        # siblingOffset starts at TRIE_NODE_SIBLING_OFFSET.offset relative to nodeBuffer
        # TRIE_NODE_SIBLING_OFFSET.offset is 1
        # TRIE_NODE_CHILD_OFFSET.offset is 5
        # TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset is 9

        # Sibling node offset
        sibling_offset = struct.unpack('>I', node_buffer[
                                             TRIE_NODE_SIBLING_OFFSET.offset: TRIE_NODE_SIBLING_OFFSET.offset + TRIE_NODE_SIBLING_OFFSET.size])[
            0]

        # Child node offset
        child_offset = struct.unpack('>I', node_buffer[
                                           TRIE_NODE_CHILD_OFFSET.offset: TRIE_NODE_CHILD_OFFSET.offset + TRIE_NODE_CHILD_OFFSET.size])[
            0]

        # Linked list of data node offsets
        head_value_list = self._create_hash_value_list(node_offset)

        # Node name
        name_start_index_in_node_buffer = TRIE_NODE_HASH_LINKED_LIST_OFFSET.offset + TRIE_NODE_HASH_LINKED_LIST_OFFSET.size
        name = ''
        if name_start_index_in_node_buffer < len(node_buffer):
            name = node_buffer[name_start_index_in_node_buffer:].decode('utf8')

        read_trie_node = ReadTrieNode(
            name=name,
            offset=node_offset,
            child_offset=child_offset if child_offset != 0 else None,
            sibling_offset=sibling_offset if sibling_offset != 0 else None,
            hash_value_list=head_value_list,
            node_size=node_size,
        )
        return read_trie_node

    def find(self, target: CharNode = None, fuzzy: str = None, partial_matches: bool = False,
             extra_challenges: list[str] = None) -> list[TrieFinderResult]:
        if extra_challenges is None:
            extra_challenges = []

        if not target:
            return []

        # Traverse to leaf nodes
        leaf_nodes = self._traverse_to_leaf(
            target=target,
            partial_matches=partial_matches,
            extra_challenges=extra_challenges,
            fuzzy=fuzzy,
        )

        if not leaf_nodes:
            return []

        # Convert matched results to actual data
        results: list[TrieFinderResult] = []
        for node in leaf_nodes:
            if not node.hash_value_list:
                continue

            data_node_head: TrieHashListNode = node.hash_value_list
            while data_node_head:
                data_node = self._read_data_node(data_node_head.hash_value_offset)

                while data_node:
                    try:
                        info = json.loads(data_node.data.decode('utf8'))
                        results.append(TrieFinderResult(
                            info=info,
                            unmatched=node.target,
                            depth=node.matched_cnt,
                            ambiguous_cnt=node.ambiguous_cnt,
                            path=node.path,
                        ))
                    except json.JSONDecodeError as e:
                        if self.debug:
                            print(f"JSON decode error: {e} for data at offset {data_node.offset}")
                    data_node = data_node.next
                data_node_head = data_node_head.next
        return results

    def _traverse_to_leaf(self, target: CharNode, partial_matches: bool, extra_challenges: list[str], fuzzy: str) -> list[TraverseQuery]:
        if not self.header.data_node_offset:
            return []

        # Dummy head for the root node, which is an empty string
        dummy_head = CharNode(original_char='', char='')
        dummy_head.next = target
        dummy_head2 = CharNode(original_char='', char='')  # For path tracking

        # FileTrieResults to store results
        results = FileTrieResults()

        # Search queue (using deque for efficient popleft)
        queue = deque([
            TraverseQuery(
                matched_cnt=-1,  # Starts at -1 because root is empty string
                ambiguous_cnt=0,
                target=dummy_head,
                offset=self.header.trie_node_offset,
                partial_matches=[],
                path=dummy_head2,
                allow_extra_challenge=len(extra_challenges) > 0,
            )
        ])

        while queue:
            current_task: TraverseQuery = queue.popleft()

            # Skip if offset is invalid (e.g., end of a branch)
            if current_task.offset is None:
                continue

            target_char_node: CharNode = current_task.target
            ambiguous_cnt: int = current_task.ambiguous_cnt
            matched_cnt: int = current_task.matched_cnt
            path_head: CharNode = current_task.path
            allow_extra_challenge: bool = current_task.allow_extra_challenge

            # Find the tail of the path
            path_tail: CharNode = path_head
            while path_tail.next:
                path_tail = path_tail.next

            node: ReadTrieNode = None
            current_offset: int = current_task.offset

            # Loop to traverse the current path
            while target_char_node and current_offset is not None:
                node = self._read_trie_node(current_offset)
                if not node:
                    raise IOError(f"Can not load the trie node at {current_offset}")

                # Character matching logic
                char_mismatch = (
                        target_char_node.char != node.name and
                        (
                                (not is_kanji_nums(node.name) and not is_digit(node.name)) or
                                (not is_kanji_nums(target_char_node.char) and not is_digit(target_char_node.char)) or
                                (to_hankaku_alpha_num(target_char_node.char) != to_hankaku_alpha_num(node.name))
                        )
                )

                if char_mismatch:
                    if target_char_node.char != fuzzy:  # Not a fuzzy match
                        if node.sibling_offset:
                            # Try sibling node
                            current_offset = node.sibling_offset
                            continue  # Continue current while loop with sibling

                        # No sibling, break this path if extra challenge not allowed
                        if not allow_extra_challenge:
                            break

                        # If extra challenge allowed, try adding extra words
                        for extra_word in extra_challenges:
                            # Only challenge if first char matches node name
                            if extra_word and extra_word[0] != node.name:
                                continue

                            extra_node = CharNode.create(extra_word)
                            extra_tail = extra_node
                            while extra_tail and extra_tail.next:
                                extra_tail = extra_tail.next

                            # Clone target from current point to append after extra_word
                            extra_tail.next = target_char_node.clone()

                            # Add new task to queue
                            challenge_task = TraverseQuery(
                                ambiguous_cnt=ambiguous_cnt + len(extra_word),
                                matched_cnt=matched_cnt,
                                target=extra_node,
                                offset=current_offset,  # Stay at current offset
                                partial_matches=list(current_task.partial_matches),  # Clone list
                                path=path_head.clone(),
                                allow_extra_challenge=False,  # Only once
                            )
                            queue.append(challenge_task)
                        break  # Break current path after adding challenges

                    # Fuzzy match (wildcard)
                    elif target_char_node.char == fuzzy and node.sibling_offset:
                        # Add a task to explore sibling path (still a fuzzy match)
                        sibling_task = TraverseQuery(
                            ambiguous_cnt=ambiguous_cnt,
                            matched_cnt=matched_cnt,
                            target=target_char_node.clone(),  # Clone target to avoid modifying original
                            offset=node.sibling_offset,  # Move to sibling
                            partial_matches=list(current_task.partial_matches),
                            path=path_head.clone(),
                            allow_extra_challenge=allow_extra_challenge,
                        )
                        queue.append(sibling_task)
                        ambiguous_cnt += 1  # Increment ambiguous count for the current path

                # If we are here, it means target_char_node.char matches node.name (or was fuzzy)
                if self.debug:
                    print(f"Matched: {matched_cnt}, Offset: {current_offset}, Node: {node.name}")

                # Add matched character to path
                path_tail.next = CharNode(
                    original_char=target_char_node.original_char,
                    char=target_char_node.char,
                    ignore=False,
                )
                path_tail = path_tail.next

                matched_cnt += 1

                # Reached a leaf in the target string or no child node in trie
                if not target_char_node.next or not node.child_offset:
                    if not node.hash_value_list:
                        break  # Found node but no associated data, so not a valid match

                    # Final match, save it
                    path_tail.next = None  # Terminate path
                    results.add(TraverseQuery(
                        matched_cnt=matched_cnt,
                        ambiguous_cnt=ambiguous_cnt,
                        hash_value_list=node.hash_value_list,
                        target=target_char_node.next.move_to_next().clone() if target_char_node.next.move_to_next() else None,
                        offset=current_offset,
                        path=path_head.clone(),
                    ))
                    if partial_matches and current_task.partial_matches:
                        for p_match in current_task.partial_matches:
                            results.add(p_match)
                    break  # Break out of inner while loop (path traversal complete)

                # Save partial match results if applicable
                if node.hash_value_list and matched_cnt > 0:
                    current_task.partial_matches.append(TraverseQuery(
                        matched_cnt=matched_cnt,
                        ambiguous_cnt=ambiguous_cnt,
                        hash_value_list=node.hash_value_list,
                        target=target_char_node.next.move_to_next().clone() if target_char_node.next.move_to_next() else None,
                        offset=current_offset,
                        path=path_head.clone(),
                    ))

                # Move to next character in target and next child node in trie
                target_char_node = target_char_node.next.move_to_next()
                current_offset = node.child_offset

            # If path traversal completed (inner while loop broke), handle remaining partial matches
            if partial_matches and current_task.partial_matches:
                for p_match in current_task.partial_matches:
                    results.add(p_match)

        return [res for res in results.values() if res.hash_value_list and res.path]
