from FN015.models.kyoto_street_trie_finder import KyotoStreetTrieFinder
from FN015.models.query_set import QuerySet
from FN015.types.match_level import MatchLevel
from FN015.services.constant_values import DASH, DEFAULT_FUZZY_CHAR
from FN015.services.reg_exp_ex import RegExpEx
from FN015.services.trim_dash_and_space import trim_dash_and_space

class KyotoStreetTransform:
    def __init__(self, trie: KyotoStreetTrieFinder):
        self.trie = trie

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        buffer = []
        for query in queries.values():
            results.add(query)
            if query.match_level.value.num > MatchLevel.MACHIAZA.value.num:
                continue
            if not query.tempAddress:
                continue
            target = query.tempAddress.replace_all(RegExpEx.create('([東西]入)る', 'g'), '$1')
            targets = [
                {
                    'target': target,
                    'ambiguous': 0,
                    'unused': [],
                    'useKoaza': True,
                }
            ]
            markers = target.match_all(
                r"(?:(?:上る|下る|東入|西入)|(?:角[東西南北])|(?:[東西南北]側))"
            )
            for marker in markers:
                koaza_node = query.tempAddress.substring(0, marker["index"])
                bearing_node = query.tempAddress.substring(marker["index"], marker["lastIndex"])
                rest_node = query.tempAddress.substring(marker["lastIndex"])

                koaza_node = koaza_node.concat(rest_node)

                targets.append({
                    'target': koaza_node,
                    'ambiguous': marker["lastIndex"] - marker["index"],
                    'unused': [bearing_node.to_original_string()],
                    'useKoaza': True,
                })

                targets.append({
                    'target': rest_node,
                    'ambiguous': marker["lastIndex"],
                    'unused': [koaza_node.to_original_string(), bearing_node.to_original_string()],
                    'useKoaza': False,
                })
            for search in targets:
                if not search['target']:
                    continue
                find_results = self.trie.find(
                    target=KyotoStreetTrieFinder.normalize(search['target']),
                    fuzzy=DEFAULT_FUZZY_CHAR,
                    partial_matches=True,
                    extra_challenges=['通', '角', '東入', '西入', '上る', '下る', '角西', '角東', '北側', '南側', '東側', '西側'],
                )
                filtered_result = []
                if find_results:
                    for result in find_results:
                        matched = True
                        if query.match_level.value.num == MatchLevel.UNKNOWN.value.num:
                            matched = True
                        if result.info and result.info.get('oaza_cho') and '丁目' in result.info.get('oaza_cho') and \
                           result.unmatched and result.unmatched.char != DASH:
                            matched = False
                        if matched and query.pref_key:
                            matched = result.info and result.info.get('pref_key') == query.pref_key
                        if matched and query.city_key:
                            matched = result.info and result.info.get('city_key') == query.city_key
                        if matched and query.oaza_cho:
                            matched = result.info and result.info.get('oaza_cho') == query.oaza_cho
                        if matched:
                            filtered_result.append(result)
                if not filtered_result:
                    continue
                for result in filtered_result:
                    if not result.info:
                        continue
                    matched_cnt = query.matchedCnt + result.depth
                    unmatched = result.unmatched
                    if (result.info and (result.info.get('oaza_cho')
                                         and '丁目' in result.info.get('oaza_cho') or result.info.get('chome')
                                         and '丁目' in result.info.get('chome'))):
                        unmatched = trim_dash_and_space(unmatched)
                        matched_cnt += 1
                    params = {
                        'tempAddress': unmatched,
                        'match_level': result.info.get('match_level', None),
                        'town_key': result.info.get('town_key', None),
                        'city': result.info.get('city', None),
                        'pref': result.info.get('pref', None),
                        'city_key': result.info.get('city_key', None),
                        'pref_key': result.info.get('pref_key', None),
                        'rsdt_addr_flg': result.info.get('rsdt_addr_flg', None),
                        'original_rsdt_addr_flg': result.info.get('rsdt_addr_flg', None),
                        'oaza_cho': result.info.get('oaza_cho', None),
                        'chome': result.info.get('chome', None),
                        'ward': result.info.get('ward', None),
                        'lg_code': result.info.get('lg_code', None),
                        'koaza': result.info.get('koaza', None),
                        'koaza_aka_code': result.info.get('koaza_aka_code', None),
                        'machiaza_id': result.info.get('machiaza_id', None),
                        'matchedCnt': matched_cnt,
                        'ambiguousCnt': query.ambiguousCnt + result.ambiguous_cnt + search['ambiguous'],
                    }
                    if result.info and result.info.get('rep_lat', None) and result.info.get('rep_lon', None):
                        params['coordinate_level'] = result.info.get('coordinate_level', None)
                        params['rep_lat'] = result.info.get('rep_lat')
                        params['rep_lon'] = result.info.get('rep_lon')
                    copied = query.copy(params)
                    buffer.append(copied)
                    if search['unused']:
                        copied.unmatched.extend(search['unused'])
        buffer.sort(key=lambda x: x.formatted.score, reverse=True)
        i = 0
        while i < len(buffer) and buffer[0].formatted.score - buffer[i].formatted.score < 5:
            results.add(buffer[i])
            i += 1
        return results 