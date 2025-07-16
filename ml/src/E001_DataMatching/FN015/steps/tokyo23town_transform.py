from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.tokyo23_town_finder import Tokyo23TownTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.services.trim_dash_and_space import trim_dash_and_space


class Tokyo23TownTransform:
    def __init__(self, tokyo23_town_trie: Tokyo23TownTrieFinder):
        self.tokyo23_town_trie = tokyo23_town_trie

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            target = trim_dash_and_space(query.tempAddress)
            # Skip if already matched at city level or higher
            if not target or query.match_level.value >= MatchLevel.CITY.value:
                results.add(query)
                continue
            search_results = self.tokyo23_town_trie.find(
                target=target,
                extra_challenges=['区', '町', '市', '村'],
                partial_matches=True,
                fuzzy=DEFAULT_FUZZY_CHAR,
            )
            if not search_results or len(search_results) == 0:
                results.add(query)
                continue
            any_hit = False
            any_ambiguous = False
            for search_result in search_results:
                if not getattr(search_result, 'info', None):
                    results.add(query)
                    continue
                    # raise Exception('searchResult.info is empty')
                # Ignore if oaza/chome/koaza is already determined
                if search_result.info.get('oaza_cho', None) or \
                   search_result.info.get('chome', None) or \
                   search_result.info.get('koaza', None):
                    continue
                any_ambiguous = any_ambiguous or getattr(search_result, 'ambiguous_cnt', 0) > 0
                any_hit = True
                params = {
                    'pref_key': search_result.info.get('pref_key'),
                    'city_key': search_result.info.get('city_key'),
                    'town_key': search_result.info.get('town_key'),
                    'original_rsdt_addr_flg': search_result.info.get('rsdt_addr_flg'),
                    'rsdt_addr_flg': search_result.info.get('rsdt_addr_flg'),
                    'tempAddress': search_result.unmatched,
                    'matchedCnt': query.matchedCnt + getattr(search_result, 'depth', 0),
                    'pref': search_result.info.get('pref'),
                    'county': search_result.info.get('county'),
                    'city': search_result.info.get('city'),
                    'ward': search_result.info.get('ward'),
                    'lg_code': search_result.info.get('lg_code'),
                    'machiaza_id': search_result.info.get('machiaza_id'),
                    'ambiguousCnt': query.ambiguousCnt + getattr(search_result, 'ambiguous_cnt', 0),
                }
                if search_result.info.get('machiaza_id', None) and \
                   search_result.info.get('machiaza_id').endswith('000'):
                    params['match_level'] = MatchLevel.MACHIAZA
                else:
                    params['match_level'] = MatchLevel.MACHIAZA_DETAIL
                if search_result.info.get('rep_lat', None) and search_result.info.get('rep_lon', None):
                    params['rep_lat'] = search_result.info.get('rep_lat')
                    params['rep_lon'] = search_result.info.get('rep_lon')
                    params['coordinate_level'] = params['match_level']
                results.add(query.copy(params))
            if not any_hit or any_ambiguous:
                results.add(query)
        queries.clear()
        return results 