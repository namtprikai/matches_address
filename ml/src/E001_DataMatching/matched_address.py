import japanese_address
from difflib import SequenceMatcher
import math
import re
from threading import Thread
import threading
import time
from queue import Queue
from concurrent.futures import ProcessPoolExecutor

result_main_queue = Queue()
result_sub_queue = Queue()
results = Queue()

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

def parse_address(addresses, type):
    parsed_address = []
    for address in addresses:
        if address and address != 'nan':
            try:
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
            except:
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
    
    if type == 'main':
        result_main_queue.put(parsed_address)
    else:
        result_sub_queue.put(parsed_address)
    # return parsed_address

def matched_address(main_df, sub_df, threshold):
    max_batch = 200

    levels = [
        "prefecture",
        "city",
        "town",
        "aza",
        "chome",
        "block"
    ]
    # main_parsed = parse_address(main_df)
    # sub_parsed = parse_address(sub_df)

    main_thread = threading.Thread(target=parse_address, args=(main_df, 'main'))
    sub_thread = threading.Thread(target=parse_address, args=(sub_df, 'sub'))
    main_thread.start()
    sub_thread.start()
    main_thread.join()
    sub_thread.join()

    main_parsed = result_main_queue.get()
    sub_parsed = result_sub_queue.get()

    batches = [main_parsed[i:i+max_batch] for i in range(0, len(main_parsed), max_batch)]

    params = [
        batches,
        sub_parsed,
        levels,
        threshold
    ]

    with ProcessPoolExecutor() as executor:
        for batch_results in executor.map(lambda p: calc_similarity_address(*p), params):
            for r in batch_results:
                results.put(r)

    data = results.get()
    print(data)

def calc_similarity_address(main_parsed, sub_parsed, levels, threshold):
    results = []
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
            for level in levels:
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
                
                results.put({
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
        results.append()
