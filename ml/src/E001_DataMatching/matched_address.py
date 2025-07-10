import japanese_address
from difflib import SequenceMatcher
import math
import re

def get_levenshtein_distance_ratio(strA: str, strB: str) -> float:
    N = len(strA)
    M = len(strB)

    dp = [[0 for _ in range(M + 1)] for _ in range(N + 1)]

    for i in range(N + 1):
        for j in range(M + 1):
            if i == 0:
                dp[i][j] = j
            elif j == 0:
                dp[i][j] = i
            else:
                insert_cost = dp[i][j - 1] + 1
                delete_cost = dp[i - 1][j] + 1
                replace_cost = dp[i - 1][j - 1] + (1 if strA[i - 1] != strB[j - 1] else 0)
                dp[i][j] = min(insert_cost, delete_cost, replace_cost)

    invert_score = dp[N][M] / max(N, M)

    score = (100 - math.floor(invert_score * 100)) / 100

    return score

def get_town(address):
    m = re.search(r"[市区郡](.*?[町村])", address)
    if m:
        return m.group(1)

    m = re.match(r"(.*?[町村])", address)
    if m:
        return m.group(1)
    return ''

def get_parsed_town(m_town, parsed_data):
    if 'city_district' in parsed_data:
        if 'town' in parsed_data:
            return f"{parsed_data['town']}{parsed_data['city_district']}"
        else:  
            return parsed_data['city_district']
    else:
        return m_town if m_town else ''

def parse_address(addresses):
    parsed_address = []
    for address in addresses:
        if address and address != 'nan':
            parsed = japanese_address.parse(address)

            if 'unparsed_right' not in parsed:
                parsed['block'] = ''
            else:
                parsed['block'] = parsed['unparsed_right']

            m_pref  = re.search(r"(.*?[都道府県])", address)
            m_city  = re.search(r"[都道府県](.*?[市区郡])", address)
            m_town  = get_town(address)
            m_aza   = re.search(r"字([^0-9丁目-]+)", address)
            m_chome = re.search(r"(\d+)丁目", address)
            m_bango = re.search(r"(\d[\d\-]+)$", address)
            address_parse = {
                "prefecture": m_pref.group(1) if m_pref else '',
                "city": m_city.group(1) if m_city else '',
                "town": get_parsed_town(m_town, parsed),
                "aza": m_aza.group(1) if m_aza else '',
                "chome": m_chome.group(1) if m_chome else '',
                "m_bango": m_bango.group(1) if m_bango else '',
                "block": parsed['block'],
                "full_address": address
            }
        else:
            address_parse = {
                "prefecture": '',
                "city": '',
                "town": '',
                "aza": '',
                "chome": '',
                "m_bango": '',
                "block": '',
                "full_address": ''
            }

        parsed_address.append(address_parse)
    
    return parsed_address

def matched_address(main_df, sub_df, threshold):
    weights = {
        "prefecture": 0.2,
        "city": 0.2,
        "town": 0.2,
        "aza": 0.2,
        "chome": 0.1,
        "block": 0.1
    }
    main_parsed = parse_address(main_df)
    sub_parsed = parse_address(sub_df)

    result = []
    for main_data in main_parsed:
        match_similarity = 0.0
        sub_address = ''
        sub_pre = ''
        sub_town = ''
        sub_city = ''
        sub_block = ''
        main_address = ''
        main_pre = ''
        main_town = ''
        main_city = ''
        main_block = ''
        for sub_data in sub_parsed:
            similarity = 0
            new_main_address = ''
            new_sub_address = ''
            for level, weight in weights.items():
                main_level = main_data.get(level, "")
                sub_level = sub_data.get(level, "")
                if main_level:
                    new_main_address += main_level
                    new_sub_address += sub_level
                    # s = SequenceMatcher(None, val1, val2).ratio()
                    # score += weight * s

            if new_main_address and new_sub_address:
                similarity = get_levenshtein_distance_ratio(new_main_address, new_sub_address)

            if similarity >= threshold:
                match_similarity = round(similarity, 2)
                sub_address = sub_data['full_address']
                main_address = main_data['full_address']
                sub_pre = sub_data['prefecture']
                sub_town = sub_data['town']
                sub_city = sub_data['city']
                sub_block = sub_data['block']
                main_pre = main_data['prefecture']
                main_town = main_data['town']
                main_city = main_data['city']
                main_block = main_data['block']
                main_compare_address = new_main_address
                sub_compare_address = new_sub_address
                
                result.append({
                    'sub_address': sub_address,
                    'main_address': main_address,
                    'score': str(match_similarity),
                    'sub_pre': sub_pre,
                    'sub_town': sub_town,
                    'sub_city': sub_city,
                    'sub_block': f"'{sub_block}",
                    'sub_compare_address': f"'{sub_compare_address}",
                    'main_pre': main_pre,
                    'main_town': main_town,
                    'main_city': main_city,
                    'main_block': f"'{main_block}",
                    'main_compare_address': f"'{main_compare_address}",
                })
    return result
