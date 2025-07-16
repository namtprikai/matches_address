from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.city_and_ward_trie_finder import CityAndWardTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.services.trim_dash_and_space import trim_dash_and_space


# Utility function for trimming dash and space from CharNode
# Assume CharNode has trim_with method


class CityAndWardTransform:
    def __init__(self, city_and_ward_trie: CityAndWardTrieFinder):
        self.city_and_ward_trie = city_and_ward_trie

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            # Skip if already matched at city level
            if query.match_level.value.num == MatchLevel.CITY.value.num:
                results.add(query)
                continue
            target = trim_dash_and_space(query.tempAddress)
            if not target:
                results.add(query)
                continue
            # Search for city or city+ward
            matched = self.city_and_ward_trie.find(
                target=target,
                extra_challenges=['市', '区'],
                partial_matches=True,
                fuzzy=DEFAULT_FUZZY_CHAR
            )
            if not matched or len(matched) == 0:
                results.add(query)
                continue
            any_hit = False
            ambiguous_cnt = 0
            for m_result in matched:
                # Skip if prefecture doesn't match (for cities with same name in different prefectures)
                if query.match_level.value.num == MatchLevel.PREFECTURE.value.num and \
                   getattr(query, 'pref_key', None) != m_result.info.get('pref_key', None):
                    continue
                ambiguous_cnt = max(ambiguous_cnt, getattr(m_result, 'ambiguous_cnt', 0))
                any_hit = True
                # Copy query and update fields
                new_query = query.copy({
                    'pref': query.pref or m_result.info.get('pref'),
                    'pref_key': query.pref_key or m_result.info.get('pref_key'),
                    'city_key': m_result.info.get('city_key'),
                    'tempAddress': getattr(m_result, 'unmatched', None),
                    'county': m_result.info.get('county'),
                    'city': m_result.info.get('city'),
                    'rep_lat': m_result.info.get('rep_lat'),
                    'rep_lon': m_result.info.get('rep_lon'),
                    'lg_code': m_result.info.get('lg_code'),
                    'ward': m_result.info.get('ward'),
                    'match_level': MatchLevel.CITY,
                    'coordinate_level': MatchLevel.CITY,
                    'matchedCnt': query.matchedCnt + getattr(m_result, 'depth', 0),
                    'ambiguousCnt': query.ambiguousCnt + getattr(m_result, 'ambiguous_cnt', 0),
                })
                results.add(new_query)
            if not any_hit or ambiguous_cnt > 0:
                results.add(query)
                queries.delete(query)
        queries.clear()
        return results 