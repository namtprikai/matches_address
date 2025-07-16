from FN015.services.constant_values import DEFAULT_FUZZY_CHAR
from FN015.models.query_set import QuerySet
from FN015.models.pref_trie_finder import PrefTrieFinder
from FN015.types.match_level import MatchLevel
from FN015.services.trim_dash_and_space import trim_dash_and_space


class PrefTransform:
    def __init__(self, pref_trie: PrefTrieFinder):
        self.pref_trie = pref_trie

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            target = trim_dash_and_space(query.tempAddress)
            if not target:
                results.add(query)
                continue
            matched = self.pref_trie.find(
                target=target,
                extra_challenges=['道', '都', '府', '県'],
                fuzzy=DEFAULT_FUZZY_CHAR,
            )
            if not matched or len(matched) == 0:
                results.add(query)
                continue
            any_hit = False
            any_ambiguous = False
            for m_result in matched:
                if not getattr(m_result, 'info', None):
                    continue
                any_ambiguous = any_ambiguous or getattr(m_result, 'ambiguous_cnt', 0) > 0
                any_hit = True
                results.add(query.copy({
                    'pref_key': m_result.info['pref_key'],
                    'tempAddress': m_result.unmatched,
                    'rep_lat': m_result.info['rep_lat'],
                    'rep_lon': m_result.info['rep_lon'],
                    'lg_code': m_result.info['lg_code'],
                    'pref': m_result.info['pref'],
                    'match_level': MatchLevel.PREFECTURE,
                    'coordinate_level': MatchLevel.PREFECTURE,
                    'matchedCnt': m_result.depth,
                    'ambiguousCnt': query.ambiguousCnt + getattr(m_result, 'ambiguous_cnt', 0),
                }))
            if not any_hit or any_ambiguous:
                results.add(query)
        queries.clear()
        return results 