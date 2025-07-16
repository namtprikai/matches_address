import re

from FN015.services.is_number import is_digit
from FN015.models.query_set import QuerySet
from FN015.types.match_level import MatchLevel
from FN015.types.search_target import SearchTarget
from FN015.services.constant_values import DASH, KANJI_NUMS, SPACE
from FN015.models.trie.char_node import CharNode
from FN015.services.trim_dash_and_space import trim_dash_and_space
from FN015.services.utils_db import get_parcel_rows, get_town_key


class ParcelTransform:

    def transform(self, queries: QuerySet) -> QuerySet:
        results = QuerySet()
        for query in queries.values():
            if query.searchTarget == SearchTarget.RESIDENTIAL:
                results.add(query)
                continue
            if query.match_level.value.num < MatchLevel.CITY.value.num:
                results.add(query)
                continue
            if query.match_level.value.num in [MatchLevel.RESIDENTIAL_BLOCK.value.num,
                                               MatchLevel.RESIDENTIAL_DETAIL.value.num]:
                results.add(query)
                continue
            if not query.lg_code or not query.tempAddress:
                results.add(query)
                continue

            search_patterns = [
                self.get_prc_id(query, 3),
                self.get_prc_id(query, 2),
                self.get_prc_id(query, 1),
            ]
            any_hit = False
            seen = set()
            reduced_params = {
                'matchedCnt': query.matchedCnt,
                'ambiguousCnt': query.ambiguousCnt,
                'tempAddress': query.tempAddress,
                'parcel_key': None,
                'prc_num1': None,
                'prc_num2': None,
                'prc_num3': None,
                'match_level': query.match_level,
                'coordinate_level': query.coordinate_level,
                'rep_lat': query.rep_lat,
                'rep_lon': query.rep_lon,
            }
            for query_info in search_patterns:
                if not query_info:
                    continue
                if query_info['parcelId'] in seen:
                    continue
                seen.add(query_info['parcelId'])
                machiaza_id = self.get_machiaza_id(query)
                find_results = get_parcel_rows(
                    town_key=get_town_key(
                        lg_code=query.lg_code or 0,
                        machiaza_id=machiaza_id or '',
                    ),
                    prc_id=query_info['parcelId'],
                )

                for info in find_results:
                    any_hit = True
                    if reduced_params['matchedCnt'] < query.matchedCnt + query_info['matchedCnt']:
                        reduced_params['matchedCnt'] = query.matchedCnt + query_info['matchedCnt']
                        reduced_params['ambiguousCnt'] = query.ambiguousCnt + query_info['ambiguousCnt']
                        reduced_params['prc_num1'] = info.get('prc_num1')
                        reduced_params['prc_num2'] = info.get('prc_num2')
                        reduced_params['prc_num3'] = info.get('prc_num3')
                        reduced_params['prc_id'] = info.get('prc_id')
                        reduced_params['match_level'] = MatchLevel.PARCEL
                        reduced_params['tempAddress'] = query_info['unmatched']
                        reduced_params['rsdt_addr_flg'] = 0
                    if reduced_params['coordinate_level'].value.num != MatchLevel.PARCEL.value.num and info.get(
                            'rep_lat'):
                        reduced_params['rep_lat'] = info.get('rep_lat')
                        reduced_params['rep_lon'] = info.get('rep_lon')
                        reduced_params['coordinate_level'] = MatchLevel.PARCEL
            if any_hit:
                copied = query.copy(reduced_params)
                results.add(copied)
            else:
                results.add(query)
        queries.clear()
        return results

    def get_machiaza_id(self, query):
        if getattr(query, 'koaza_aka_code', None) != 2:
            return query.machiaza_id
        return query.machiaza_id[:4] + '000' if query.machiaza_id else None

    def get_prc_id(self, query, num_of_parcel_nums: int):
        """
        Translates the TypeScript getPrcId function to Python.
        Calculates a parcel ID based on an address query.
        """
        PARCEL_LENGTH = 5
        ZERO_FILL = '0'.zfill(PARCEL_LENGTH)  # Python equivalent of padStart

        buffer = []
        current = []
        target_node_list = trim_dash_and_space(query.tempAddress)
        if not target_node_list:
            return None

        before, *after = target_node_list.split(SPACE)

        head: CharNode = before.trim_with(DASH) if before else None
        kanji_nums_regex = re.compile(f"[{KANJI_NUMS}]")

        matched_cnt = 0
        ambiguous_cnt = 0

        while head and not head.ignore:
            matched_cnt += 1
            if head.char == query.fuzzy:
                # fuzzyの場合、任意の１文字 (SQL wildcard)
                current.append('_')
                ambiguous_cnt += 1
            elif head.char.isdigit():
                # 数字の後ろの文字をチェック
                # SPACE, DASH, 漢数字、または終了なら、追加する
                tmp_buffer = []
                pointer: CharNode = head
                # temp_matched_count = 0  # To track chars consumed in this number sequence

                while pointer and is_digit(pointer) and not pointer.ignore:
                    tmp_buffer.append(pointer.char)
                    pointer = pointer.next
                    # temp_matched_count += 1

                # Check the character immediately after the digit sequence
                # If it's None (end of string), ignore, SPACE, or Kanji number
                if not pointer or pointer.ignore or pointer.char == SPACE or kanji_nums_regex.search(
                        pointer.original_char):
                    current.extend(tmp_buffer)
                    buffer.append(''.join(current).rjust(PARCEL_LENGTH, '0'))
                    head = pointer
                    current = []  # Reset current for next segment
                    matched_cnt += len(tmp_buffer)  # Subtract 1 because it's incremented at the start of loop
                    break  # Exit loop after finding a complete parcel number

                # If the character after the digit sequence is not a DASH, then break the loop.
                # This implies the number sequence is not part of a parcel number series.
                if pointer.char != DASH:
                    break

                # If it's a DASH, continue building the current segment
                current.extend(tmp_buffer)
                head = pointer
                matched_cnt += len(tmp_buffer)  # Subtract 1 because it's incremented at the start of loop

                buffer.append(''.join(current).rjust(PARCEL_LENGTH, '0'))

                current = []  # Clear current after pushing to buffer

            elif head.char == DASH:
                # If a dash is encountered, the current accumulated numbers form a parcel number
                if current:  # Only push if there are accumulated numbers
                    buffer.append(''.join(current).rjust(PARCEL_LENGTH, '0'))
                    current = []
                # Else, if current is empty and we hit a dash, just skip it.
            else:
                break  # Non-digit, non-fuzzy, non-dash character, so stop processing parcel numbers

            # numOfParcelNumsの数値を取ったらループを抜ける
            # (〇〇番地△△ の「番地△△」を残す)
            if len(buffer) == num_of_parcel_nums:
                break

            # Advance head to the next character in the CharNode sequence
            head = head.next

        if current:  # If there are any remaining characters in `current` buffer
            buffer.append(''.join(current).rjust(PARCEL_LENGTH, '0'))

        # prc_num1,2,3 を用意する (Fill with ZERO_FILL if less than 3)
        for i in range(len(buffer), 3):
            buffer.append(ZERO_FILL)

        parcel_id = "".join(buffer)

        # マッチしなかった残り文字列 (unmatched)
        unmatched: CharNode = head

        if len(after) > 0:
            unmatched = CharNode.join_with(CharNode(char=SPACE), unmatched, *after)

        return {
            'parcelId': parcel_id,
            'unmatched': unmatched,
            'matchedCnt': matched_cnt,
            'ambiguousCnt': ambiguous_cnt,
        }
