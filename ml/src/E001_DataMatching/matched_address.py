import japanese_address
from difflib import SequenceMatcher
import math
import re
from threading import Thread
import threading
from queue import Queue
from concurrent.futures import ProcessPoolExecutor
from joblib import Parallel, delayed
import pandas as pd
from E012 import kanji_to_chome


result_main_queue = Queue()
result_sub_queue = Queue()

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

def matched_address(main_df, sub_df):
    levels = [
        "prefecture",
        "city",
        "town",
        "aza",
        "chome",
        "block"
    ]

    main_thread = threading.Thread(target=parse_address, args=(main_df, 'main'))
    sub_thread = threading.Thread(target=parse_address, args=(sub_df, 'sub'))
    main_thread.start()
    sub_thread.start()
    main_thread.join()
    sub_thread.join()

    main_parsed = result_main_queue.get()
    sub_parsed = result_sub_queue.get()
    results = []

    main_index = 0
    sub_index = 0

    for main_index, main_data in enumerate(main_parsed):
        match_similarity = 0.0
        matched_data = {}
        for sub_index, sub_data in enumerate(sub_parsed):
            similarity = 0
            new_main_address = ''
            new_sub_address = ''
            for level in levels:
                main_level = main_data.get(level, "")
                sub_level = sub_data.get(level, "")
                if sub_level:
                    new_main_address += main_level
                    new_sub_address += sub_level

            if new_main_address and new_sub_address:
                new_main_address = re.sub(r'([一二三四五六七八九十]+)丁目', kanji_to_chome, new_main_address)
                similarity = get_levenshtein_distance_ratio(new_main_address, new_sub_address)

                if similarity > match_similarity:
                    match_similarity = round(similarity, 2)
                    matched_data = {
                        'main_address': main_data['full_address'],
                        'sub_address': sub_data['full_address'],
                        'main_index': main_index,
                        'sub_index': sub_index,
                        'score': match_similarity,
                    }
        results.append(matched_data)

    return results
