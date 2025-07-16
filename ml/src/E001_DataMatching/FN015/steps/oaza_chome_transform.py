from typing import Dict
from FN015.services.constant_values import DASH, DEFAULT_FUZZY_CHAR
from FN015.services.reg_exp_ex import RegExpEx
from FN015.types.match_level import MatchLevel
from FN015.types.pref_lg_code import PrefLgCode, to_pref_lg_code
from FN015.models.trie.char_node import CharNode
from FN015.models.oaza_cho_trie_finder import OazaChoTrieFinder
from FN015.models.query import Query
from FN015.models.query_set import QuerySet
from FN015.services.is_number import is_digit
from FN015.services.trim_dash_and_space import trim_dash_and_space
from FN015.services.is_kanji_nums import is_kanji_nums

class OazaChomeTransform:
    def __init__(self, trie_trees: Dict[PrefLgCode, OazaChoTrieFinder]):
        self.trie_trees = trie_trees

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            if not query.tempAddress:
                results.add(query)
                continue
            if getattr(query, 'koaza_aka_code', None) == 2:
                results.add(query)
                continue
            bearing_word = query.tempAddress.match(RegExpEx.create('(?:(?:上る|下る|東入る?|西入る?)|(?:角[東西南北])|(?:[東西南北]側))'))
            if bearing_word:
                results.add(query)
                continue

            trie_trees = []
            if not query.lg_code:
                trie_trees.extend(self.trie_trees.values())
            else:
                pref_lg_code = to_pref_lg_code(query.lg_code)
                if not pref_lg_code or pref_lg_code not in self.trie_trees:
                    results.add(query)
                    continue
                trie_trees.append(self.trie_trees[pref_lg_code])
            copied_query = self.normalize_query(query)
            targets = QuerySet()
            targets.add(copied_query)
            if query.oaza_cho:
                prefix = CharNode.create(query.oaza_cho)
                if query.chome:
                    if prefix:
                        prefix = prefix.concat(CharNode.create(query.chome))
                    else:
                        prefix = CharNode.create(query.chome)
                if prefix:
                    targets.add(copied_query.copy({
                        'oaza_cho': '',
                        'matchedCnt': copied_query.matchedCnt - len(prefix.to_original_string()),
                        'tempAddress': prefix.concat(copied_query.tempAddress),
                    }))
            if copied_query.tempAddress and copied_query.tempAddress.includes(RegExpEx.create('([0-9])番町', 'g')):
                targets.add(copied_query.copy({
                    'tempAddress': copied_query.tempAddress.replace(RegExpEx.create('([0-9])番町', 'g'), '$1'),
                }))
            if copied_query.tempAddress and copied_query.tempAddress.includes('町'):
                targets.add(copied_query.copy({
                    'tempAddress': copied_query.tempAddress.replace('町', ''),
                }))
            if query.match_level.value.num >= MatchLevel.MACHIAZA.value.num:
                results.add(query)
            any_hit = False
            any_ambiguous = False
            for trie in trie_trees:
                trie.debug = False
                for target_query in targets.values():
                    if not target_query or not target_query.tempAddress:
                        continue
                    find_results = trie.find(
                        target=target_query.tempAddress,
                        partial_matches=True,
                        fuzzy=DEFAULT_FUZZY_CHAR,
                    ) or []
                    filtered_result = []
                    for result in find_results:
                        if result.depth == 0:
                            continue
                        if query.pref_key and result.info.get('pref_key', None) != query.pref_key:
                            continue
                        if query.city_key and result.info.get('city_key', None) != query.city_key:
                            continue
                        if is_digit(result.unmatched):
                            path_tail = result.path
                            while getattr(path_tail, 'next', None):
                                path_tail = path_tail.next
                            if is_digit(getattr(path_tail, 'char', None)):
                                is_tail_kanji_num = is_kanji_nums(getattr(path_tail, 'original_char', None))
                                is_unmatched_kanji_num = is_kanji_nums(getattr(result.unmatched, 'original_char', None))
                                if is_tail_kanji_num == is_unmatched_kanji_num:
                                    continue
                        filtered_result.append(result)
                    for result in filtered_result:
                        ambiguous_cnt = target_query.ambiguousCnt + result.ambiguous_cnt
                        matched_cnt = target_query.matchedCnt + result.depth
                        if target_query.oaza_cho and target_query.oaza_cho != result.info.get('oaza_cho', None):
                            any_ambiguous = True
                            ambiguous_cnt += len(target_query.oaza_cho)
                            continue
                        info = result.info
                        unmatched = result.unmatched
                        if info.get('chome') and ('丁目' in info.get('chome') or '丁目' in info.get('oaza_cho')) and getattr(result.unmatched, 'char', None) == DASH:
                            matched_cnt += 1
                            unmatched = trim_dash_and_space(result.unmatched)
                        if info.get('oaza_cho') and info.get('oaza_cho').endswith('町') and getattr(unmatched, 'char', None) == '町':
                            unmatched = unmatched.next.move_to_next() if unmatched.next else None
                            matched_cnt += 1
                        if info.get('chome') and info.get('chome').endswith('町') and getattr(unmatched, 'char', None) == '町':
                            unmatched = unmatched.next.move_to_next() if unmatched.next else None
                            matched_cnt += 1
                        any_hit = True
                        params = {
                            'pref_key': info.get('pref_key'),
                            'city_key': info.get('city_key'),
                            'town_key': info.get('town_key'),
                            'lg_code': info.get('lg_code'),
                            'pref': info.get('pref'),
                            'city': info.get('city'),
                            'oaza_cho': info.get('oaza_cho'),
                            'chome': info.get('chome'),
                            'koaza': info.get('koaza'),
                            'ward': info.get('ward'),
                            'machiaza_id': info.get('machiaza_id'),
                            'rsdt_addr_flg': info.get('rsdt_addr_flg'),
                            'original_rsdt_addr_flg': info.get('rsdt_addr_flg'),
                            'tempAddress': unmatched,
                            'match_level': info.get('match_level'),
                            'matchedCnt': matched_cnt,
                            'ambiguousCnt': ambiguous_cnt,
                        }
                        if info.get('rep_lat', None) and info.get('rep_lon', None):
                            params['rep_lat'] = info.get('rep_lat')
                            params['rep_lon'] = info.get('rep_lon')
                            params['coordinate_level'] = info.get('coordinate_level')
                        copied = target_query.copy(params)
                        results.add(copied)
                trie.debug = False
            if not any_hit or any_ambiguous:
                results.add(query)
        queries.clear()
        return results

    def normalize_query(self, query: Query) -> Query:
        address = query.tempAddress.trim_with(DASH) if query.tempAddress else None
        if query.city == '福井市' and query.pref == '福井県':
            address = address.replace_all(RegExpEx.create('^99', 'g'), 'つくも') if address else None
        if query.city == '海田町' and query.pref == '広島県' and getattr(query, 'county', None) == '安芸郡':
            address = address.replace_all(RegExpEx.create('^(南)?99町', 'g'), '$1つくも町') if address else None
        address = OazaChoTrieFinder.normalize(address) if address else None
        return query.copy({'tempAddress': address})
