from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.county_and_city_trie_finder import CountyAndCityTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.services.trim_dash_and_space import trim_dash_and_space


class CountyAndCityTransform:
    def __init__(self, county_and_city_trie: CountyAndCityTrieFinder):
        self.county_and_city_trie = county_and_city_trie

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            # Skip if already matched at city level or higher
            if query.match_level.value.num >= MatchLevel.CITY.value.num:
                results.add(query)
                continue
            target = trim_dash_and_space(query.tempAddress)
            if not target:
                results.add(query)
                continue
            # Search for county+city
            matched = self.county_and_city_trie.find(
                target=target,
                extra_challenges=['郡', '市', '町', '村'],
                partial_matches=True,
                fuzzy=DEFAULT_FUZZY_CHAR,
            )
            if not matched or len(matched) == 0:
                results.add(query)
                continue
            any_hit = False
            ambiguous_cnt = 0
            for m_result in matched:
                # Skip if prefecture doesn't match (for cities with same name in different prefectures)
                if query.match_level.value.num == MatchLevel.PREFECTURE.value.num and \
                   getattr(query, 'pref_key', None) != getattr(m_result.info, 'pref_key', None):
                    continue
                any_hit = True
                ambiguous_cnt = max(ambiguous_cnt, getattr(m_result, 'ambiguous_cnt', 0))
                new_query = query.copy({
                    'pref': query.pref or getattr(m_result.info, 'pref', None),
                    'pref_key': query.pref_key or getattr(m_result.info, 'pref_key', None),
                    'city_key': getattr(m_result.info, 'city_key', None),
                    'tempAddress': getattr(m_result, 'unmatched', None),
                    'city': getattr(m_result.info, 'city', None),
                    'county': getattr(m_result.info, 'county', None),
                    'ward': getattr(m_result.info, 'ward', None),
                    'rep_lat': getattr(m_result.info, 'rep_lat', None),
                    'rep_lon': getattr(m_result.info, 'rep_lon', None),
                    'lg_code': getattr(m_result.info, 'lg_code', None),
                    'match_level': MatchLevel.CITY,
                    'coordinate_level': MatchLevel.CITY,
                    'matchedCnt': query.matchedCnt + getattr(m_result, 'depth', 0),
                    'ambiguousCnt': query.ambiguousCnt + getattr(m_result, 'ambiguous_cnt', 0),
                })
                results.add(new_query)
            if not any_hit or ambiguous_cnt > 0:
                results.add(query)
        queries.clear()
        return results 