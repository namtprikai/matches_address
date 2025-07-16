from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.tokyo23_ward_trie_finder import Tokyo23WardTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.types.pref_lg_code import PrefLgCode
from FN015.services.trim_dash_and_space import trim_dash_and_space


class Tokyo23WardTransform:
    def __init__(self, tokyo23_ward_trie: Tokyo23WardTrieFinder):
        self.tokyo23_ward_trie = tokyo23_ward_trie
        self.needs_copy = set(['北区', '中央区', '港区', '大田区', '板橋区'])

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            # Skip if already matched at city level or higher
            if not query.tempAddress or query.match_level.value.num >= MatchLevel.CITY.value.num:
                results.add(query)
                continue
            target = trim_dash_and_space(query.tempAddress)
            if not target:
                results.add(query)
                continue
            search_results = self.tokyo23_ward_trie.find(
                target=target,
                extra_challenges=['区'],
                partial_matches=True,
                fuzzy=DEFAULT_FUZZY_CHAR,
            )
            if not search_results or len(search_results) == 0:
                results.add(query)
                continue
            any_ambiguous = False
            any_hit = False
            for search_result in search_results:
                if not getattr(search_result, 'info', None):
                    raise Exception('searchResult.info is empty')
                # If not Tokyo and ambiguous ward name, keep ambiguous
                if query.lg_code != PrefLgCode.TOKYO.value and search_result.info.get('city', None) in self.needs_copy:
                    any_ambiguous = True
                any_ambiguous = any_ambiguous or getattr(search_result, 'ambiguous_cnt', 0) > 0
                any_hit = True
                results.add(query.copy({
                    'pref_key': search_result.info.get('pref_key'),
                    'city_key': search_result.info.get('city_key'),
                    'tempAddress': search_result.unmatched,
                    'match_level': MatchLevel.CITY,
                    'matchedCnt': query.matchedCnt + getattr(search_result, 'depth', 0),
                    'pref': search_result.info.get('pref'),
                    'city': search_result.info.get('city'),
                    'lg_code': search_result.info.get('lg_code'),
                    'rep_lat': search_result.info.get('rep_lat'),
                    'rep_lon': search_result.info.get('rep_lon'),
                    'coordinate_level': MatchLevel.CITY,
                    'ambiguousCnt': query.ambiguousCnt + getattr(search_result, 'ambiguous_cnt', 0),
                }))
            if not any_hit or any_ambiguous:
                results.add(query)
        queries.clear()
        return results