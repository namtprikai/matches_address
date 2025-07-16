import re
from typing import Any, Dict

from FN015.models.query_set import QuerySet
from FN015.types.match_level import MatchLevel
from FN015.types.search_target import SearchTarget
from FN015.services.trim_dash_and_space import trim_dash_and_space
from FN015.services.constant_values import DASH, DEFAULT_FUZZY_CHAR, SPACE
from FN015.services.utils_db import get_block_num_rows


class RsdtBlkTransform:
    def transform(self, queries: QuerySet):
        results = QuerySet()
        # 非同期イテレータを使用
        for query in queries.values():
            if query.searchTarget == SearchTarget.PARCEL:
                # 地番検索が指定されている場合、このステップはスキップする
                results.add(query)
                continue

            if query.city == '京都市':
                # 京都市がマッチしている場合、スキップする
                # (京都市は住居表示を行っていない)
                results.add(query)
                continue

            # town_key が必要なので、MatchLevel.MACHIAZA 未満はスキップ
            # もしくは 既に地番データが判明している場合もスキップ
            if query.match_level.value.num < MatchLevel.MACHIAZA.value.num or \
                    query.match_level.value.num == MatchLevel.PARCEL.value.num:
                results.add(query)
                continue

            if not query.tempAddress:
                # 探索する文字がなければスキップ
                results.add(query)
                continue

            if not query.town_key:
                results.add(query)
                continue
            if not query.lg_code:
                results.add(query)
                continue

            query_info = RsdtBlkTransform.get_block_num(query)
            try:
                find_results = get_block_num_rows(
                    town_key=query.town_key,
                    blk_num=query_info['block_num'],  # blk_numは文字列として渡す
                )
            except:
                find_results = []

            # 住居表示が間違えている可能性があるので、地番のために残しておく
            results.add(query)

            for result in find_results:
                params: Dict[str, Any] = {
                    'block': str(result['blk_num']),  # 数値を文字列に変換
                    'block_id': result['blk_id'],
                    'rsdtblk_key': result['rsdtblk_key'],
                    'tempAddress': query_info['unmatched'],
                    'match_level': MatchLevel.RESIDENTIAL_BLOCK,
                    'matched_cnt': query.matchedCnt + query_info['matchedCnt'],
                    'rsdt_addr_flg': 1,
                }
                if result.get('rep_lat') is not None and result.get('rep_lon') is not None:
                    params['coordinate_level'] = MatchLevel.RESIDENTIAL_BLOCK
                    params['rep_lat'] = result['rep_lat']
                    params['rep_lon'] = result['rep_lon']

                copied = query.copy(params)
                results.add(copied)

        queries.clear()

        # コールバックを呼び出し、変換結果を渡す
        return results

    def get_block_num(query):
        p = trim_dash_and_space(query.tempAddress)
        buffer = []
        matched_cnt = 0

        while p:
            if p.char == DEFAULT_FUZZY_CHAR:
                buffer.append('_')
                matched_cnt += 1
            elif re.match(r'[0-9]', p.char or ''):
                buffer.append(p.char)
                matched_cnt += 1
            else:
                break
            p = p.next

        # レアケースで「渡辺」という番地がある
        if matched_cnt == 0:
            p = query.tempAddress
            while p:
                if p.char in (SPACE, DASH):
                    break
                matched_cnt += 1
                buffer.append(p.char)
                p = p.next

        return {
            "block_num": ''.join(buffer),
            "block_id": query.block_id,
            "unmatched": p,
            "matchedCnt": matched_cnt,
        }
