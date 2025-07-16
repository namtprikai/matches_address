from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.ward_trie_finder import WardTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.services.trim_dash_and_space import trim_dash_and_space


class WardTransform:
    def __init__(self, ward_trie: WardTrieFinder):
        self.ward_trie = ward_trie

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
            matched = self.ward_trie.find(
                target=target,
                extra_challenges=['市', '区'],
                fuzzy=DEFAULT_FUZZY_CHAR,
                partial_matches=True,
            )
            if not matched or len(matched) == 0:
                results.add(query)
                continue
            any_ambiguous = False
            any_hit = False
            for m_result in matched:
                if query.pref_key and query.pref_key != m_result.info.get('pref_key', None):
                    continue
                any_ambiguous = any_ambiguous or getattr(m_result, 'ambiguous_cnt', 0) > 0
                any_hit = True
                results.add(query.copy({
                    'pref_key': m_result.info.get('pref_key'),
                    'city_key': m_result.info.get('city_key'),
                    'pref': m_result.info.get('pref'),
                    'city': m_result.info.get('city'),
                    'lg_code': m_result.info.get('lg_code'),
                    'county': m_result.info.get('county'),
                    'ward': m_result.info.get('ward'),
                    'tempAddress': m_result.unmatched,
                    'match_level': MatchLevel.CITY,
                    'matchedCnt': query.matchedCnt + getattr(m_result, 'depth', 0),
                    'rep_lat': m_result.info.get('rep_lat'),
                    'rep_lon': m_result.info.get('rep_lon'),
                    'coordinate_level': MatchLevel.CITY,
                    'ambiguousCnt': query.ambiguousCnt + getattr(m_result, 'ambiguous_cnt', 0),
                }))
            if not any_hit or any_ambiguous or query.match_level == MatchLevel.UNKNOWN:
                results.add(query)
        queries.clear()
        return results