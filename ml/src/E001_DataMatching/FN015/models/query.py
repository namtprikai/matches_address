import re
import time
from typing import Optional, Dict, Any, List

from FN015.services.constant_values import DASH_SYMBOLS, DASH, SPACE
from FN015.services.reg_exp_ex import RegExpEx
from FN015.types.match_level import MatchLevel
from FN015.types.search_target import SearchTarget
from FN015.services.get_levenshtein_distance_ratio import get_levenshtein_distance_ratio
from FN015.models.trie.char_node import CharNode
from FN015.services.to_hankaku_alpha_num import to_hankaku_alpha_num


class Query:
    # All properties are Optional or have default values, matching TypeScript's interface
    def __init__(self, params: Dict[str, Any]):
        # Initialize all properties from params or with default values
        self.input = params.get('input')
        self.tempAddress: Optional[CharNode] = params.get('tempAddress')
        self.matchedCnt: int = params.get('matchedCnt', 0)
        self.startTime: int = params.get('startTime', 0)  # Using int for Unix timestamp
        self.fuzzy: Optional[str] = params.get('fuzzy')
        self.searchTarget: SearchTarget = params.get('searchTarget')
        self.unmatched: List[str] = params.get('unmatched', [])

        self.pref_key: Optional[int] = params.get('pref_key')
        self.city_key: Optional[int] = params.get('city_key')
        self.town_key: Optional[int] = params.get('town_key')
        self.rsdtblk_key: Optional[int] = params.get('rsdtblk_key')
        self.rsdtdsp_key: Optional[int] = params.get('rsdtdsp_key')
        self.parcel_key: Optional[int] = params.get('parcel_key')

        self.machiaza_id: Optional[str] = params.get('machiaza_id')
        self.original_rsdt_addr_flg: Optional[int] = params.get('original_rsdt_addr_flg')
        self.rsdt_addr_flg: Optional[int] = params.get('rsdt_addr_flg')
        self.koaza_aka_code: Optional[int] = params.get('koaza_aka_code')

        self.pref: Optional[str] = params.get('pref')
        self.county: Optional[str] = params.get('county')
        self.city: Optional[str] = params.get('city')
        self.ward: Optional[str] = params.get('ward')
        self.oaza_cho: Optional[str] = params.get('oaza_cho')
        self.chome: Optional[str] = params.get('chome')
        self.koaza: Optional[str] = params.get('koaza')
        self.lg_code: Optional[str] = params.get('lg_code')

        self.rep_lat: Optional[str] = params.get('rep_lat')
        self.rep_lon: Optional[str] = params.get('rep_lon')

        self.block: Optional[str] = params.get('block')
        self.block_id: Optional[str] = params.get('block_id')
        self.rsdt_num: Optional[int] = params.get('rsdt_num')
        self.rsdt_id: Optional[str] = params.get('rsdt_id')
        self.rsdt_num2: Optional[int] = params.get('rsdt_num2')
        self.rsdt2_id: Optional[str] = params.get('rsdt2_id')

        self.prc_num1: Optional[str] = params.get('prc_num1')
        self.prc_num2: Optional[str] = params.get('prc_num2')
        self.prc_num3: Optional[str] = params.get('prc_num3')
        self.prc_id: Optional[str] = params.get('prc_id')

        self.match_level = params.get('match_level', MatchLevel.UNKNOWN)
        self.coordinate_level = params.get('coordinate_level', MatchLevel.UNKNOWN)

        if isinstance(self.match_level, dict):
            self.match_level = self.to_match_level(self.match_level)

        if isinstance(self.coordinate_level, dict):
            self.coordinate_level = self.to_match_level(self.coordinate_level)

        self.ambiguousCnt: int = params.get('ambiguousCnt', 0)

        self.debug: Dict[str, Optional[str]] = {
            'original': self.tempAddress.to_original_string() if self.tempAddress else None,
            'processed': self.tempAddress.to_string() if self.tempAddress else None,
        }
        self.formatted = self._get_formatted_address()

    def to_match_level(self, data: dict) -> MatchLevel:
        for level in MatchLevel:
            if level.value.num == data['num']:
                return level
        raise ValueError(f"No MatchLevel found for num: {data['num']}")

    # Convert to JSON representation
    def to_json(self):
        return {
            'ambiguousCnt': self.ambiguousCnt,
            'fuzzy': self.fuzzy,
            'searchTarget': self.searchTarget,
            'city_key': self.city_key,
            'pref_key': self.pref_key,
            'town_key': self.town_key,
            'rsdtblk_key': self.rsdtblk_key,
            'rsdtdsp_key': self.rsdtdsp_key,
            'matchedCnt': self.matchedCnt,
            'startTime': self.startTime,
            'input': self.input,
            'tempAddress': self.tempAddress.to_string() if self.tempAddress else None,
            'unmatched': self.unmatched,
            'pref': self.pref,
            'county': self.county,
            'city': self.city,
            'ward': self.ward,
            'oaza_cho': self.oaza_cho,
            'chome': self.chome,
            'koaza': self.koaza,
            'lg_code': self.lg_code,
            'rep_lat': self.rep_lat,
            'rep_lon': self.rep_lon,
            'rsdt_addr_flg': self.rsdt_addr_flg,
            'original_rsdt_addr_flg': self.original_rsdt_addr_flg,
            'koaza_aka_code': self.koaza_aka_code,
            'machiaza_id': self.machiaza_id,
            'block': self.block,
            'block_id': self.block_id,
            'rsdt_num': self.rsdt_num,
            'rsdt_id': self.rsdt_id,
            'rsdt_num2': self.rsdt_num2,
            'rsdt2_id': self.rsdt2_id,
            'prc_id': self.prc_id,
            'prc_num1': self.prc_num1,
            'prc_num2': self.prc_num2,
            'prc_num3': self.prc_num3,
            'parcel_key': self.parcel_key,
            'match_level': self.match_level,
            'coordinate_level': self.coordinate_level,
        }

    # Create a copy with new values
    def copy(self, new_values) -> 'Query':
        # Create a combined dictionary of existing values and new values
        # New values overwrite existing ones
        combined_params = {**self.__dict__, **new_values}

        # Handle rep_lat/rep_lon special logic from TS
        if 'rep_lat' in new_values or 'rep_lon' in new_values:
            if not new_values.get('rep_lat') or not new_values.get('rep_lon'):
                combined_params.pop('rep_lat', None)
                combined_params.pop('rep_lon', None)
                combined_params.pop('coordinate_level', None)

        # Re-create CharNode from string if tempAddress is updated as string
        if 'tempAddress' in new_values and isinstance(new_values['tempAddress'], str):
            combined_params['tempAddress'] = CharNode.from_string(new_values['tempAddress'])

        return Query(combined_params)

    # Eliminate empty elements from a list of strings
    def _eliminate_empty_element(self, str_list: List[Optional[str]]) -> List[str]:
        return [value for value in str_list if value is not None and value.strip() != '']

    # Generate formatted_address
    def _get_formatted_address(self):
        formatted_address_parts: List[str] = []

        # Pref/County/City/Ward
        # FIX: Call join on the empty string, not the list.
        address_components = ''.join(self._eliminate_empty_element([
            self.pref.strip() if self.pref else None,
            self.county.strip() if self.county else None,
            self.city.strip() if self.city else None,
            self.ward.strip() if self.ward else None,
        ]))
        formatted_address_parts.append(address_components)
        if self.koaza_aka_code == 2:  # Kyoto street name
            formatted_address_parts.append(
                ''.join(self._eliminate_empty_element([  # FIX: Call join on the empty string
                    self.koaza.strip() if self.koaza else None,
                    self.oaza_cho.strip() if self.oaza_cho else None,
                ]))
            )
        else:  # Normal order (Oaza, Chome, Koaza)
            formatted_address_parts.append(
                ''.join(self._eliminate_empty_element([  # FIX: Call join on the empty string
                    self.oaza_cho.strip() if self.oaza_cho else None,
                    self.chome.strip() if self.chome else None,
                    self.koaza.strip() if self.koaza else None,
                ]))
            )
        if self.match_level.value.num == MatchLevel.PARCEL.value.num:
            parcel_nums = []
            for prc_num in [self.prc_num1, self.prc_num2, self.prc_num3]:
                if not prc_num:  # Use `is None` for explicit None check
                    break
                parcel_nums.append(prc_num)
            formatted_address_parts.append('-'.join(parcel_nums))
        else:  # Residential number block/address (住居番号の街区・番地)
            residential_nums = '-'.join(self._eliminate_empty_element([  # FIX: Call join on the dash string
                str(self.block).strip() if self.block is not None else None,  # Convert to string if not None
                str(self.rsdt_num).strip() if self.rsdt_num is not None else None,
                str(self.rsdt_num2).strip() if self.rsdt_num2 is not None else None,
            ]))
            formatted_address_parts.append(residential_nums)

        if self.tempAddress:
            other = self.tempAddress.to_original_string().strip() if self.tempAddress.to_original_string() else None
            if other:
                # Check if the last part of formatted_address_parts ends with certain symbols
                last_formatted_part = formatted_address_parts[-1] if formatted_address_parts else ''
                combined_symbols_for_regex = f"号番通条町街丁階線F{re.escape(DASH)}{re.escape(SPACE)}"  # Assuming DASH and SPACE are single chars
                if not RegExpEx.create(f'[{combined_symbols_for_regex}]').search(last_formatted_part):
                    is_tail_digit = RegExpEx.create(r'[0-9]').search(
                        last_formatted_part[-1] if last_formatted_part else '')
                    is_head_digit = RegExpEx.create(r'[0-9]').search(other[0] if other else '')
                    # isHeadDash should consider DASH_SYMBOLS
                    is_head_dash = RegExpEx.create(f'[{DASH_SYMBOLS}]').search(other[0] if other else '')

                    if (is_tail_digit and is_head_digit) or \
                            (is_tail_digit and not is_head_dash):
                        formatted_address_parts.append(' ')

                # The commented out block in TS was about "123どこかのビル"
                # If you need to implement it, it would be done here similar to how other regex replacements are done.
                if other:
                    formatted_address_parts.append(other)

        # Final string creation and cleanup
        result = ''.join(formatted_address_parts)
        result = RegExpEx.create(r' +', 'g').sub(SPACE, result)  # Consolidate spaces
        result = RegExpEx.create(r'丁目-([0-9])', 'g').sub(r'丁目\1', result)  # Fix "丁目-1" to "丁目1"
        result = result.strip()

        # 最終的な文字列と一番最初のクエリ文字列の類似度を計算する
        original_input_address = self.input.data.address
        original_input_address = RegExpEx.create(r'[ 　]+', 'g').sub(SPACE, original_input_address)

        score = get_levenshtein_distance_ratio(
            to_hankaku_alpha_num(result),
            to_hankaku_alpha_num(original_input_address)
        )

        return {
            'address': result,
            'score': score
        }

    def release(self):
        if self.tempAddress:
            self.tempAddress.release()  # This sets node.next = None recursively
            self.tempAddress = None

    # Static method to create Query from JSON (for inter-thread communication or deserialization)
    @staticmethod
    def from_json(params) -> 'Query':
        # Default match_level if not provided
        if 'match_level' not in params:
            params['match_level'] = MatchLevel.UNKNOWN
        if 'coordinate_level' not in params:
            params['coordinate_level'] = MatchLevel.UNKNOWN

        # Convert match_level and coordinate_level back to MatchLevel._Level objects
        match_level_obj = params['match_level']
        coordinate_level_obj = params['coordinate_level']

        # Create a mutable copy of params to modify
        _params = dict(params)
        _params['match_level'] = match_level_obj
        _params['coordinate_level'] = coordinate_level_obj

        # Handle tempAddress conversion from string to CharNode
        temp_address_str = _params.pop('tempAddress', None)  # Remove from dict before passing
        if temp_address_str is not None:
            _params['tempAddress'] = CharNode.from_string(temp_address_str)
        else:
            _params['tempAddress'] = None  # Ensure it's explicitly None if not provided

        return Query(_params)

    # Static method to create a new Query instance
    @staticmethod
    def create(input_data) -> 'Query':
        # Trim leading/trailing spaces from the input address
        input_data.data.address = input_data.data.address.strip()

        # Convert address string to CharNode linked list
        temp_address = CharNode.create(input_data.data.address)

        # Initialize default values
        params: Dict[str, Any] = {
            'input': input_data,
            'tempAddress': temp_address,
            'matchedCnt': 0,
            'match_level': MatchLevel.UNKNOWN,
            'coordinate_level': MatchLevel.UNKNOWN,
            'startTime': int(time.time() * 1000),  # Milliseconds timestamp
            'fuzzy': getattr(input_data.data, 'fuzzy', ''),
            'searchTarget': getattr(input_data.data, 'searchTarget', SearchTarget.ALL),  # Default to ALL
            'ambiguousCnt': 0,
            'unmatched': [],
        }
        return Query(params)
