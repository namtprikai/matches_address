from concurrent.futures import ThreadPoolExecutor
import os
import sys
import warnings
import japanese_address
import math
import re
import logging
import pickle
from rapidfuzz.distance import Levenshtein
from collections import defaultdict

logging.disable(logging.CRITICAL)

warnings.filterwarnings("ignore")
current_dir = os.path.dirname(os.path.abspath(__file__))
async_tasks_path = os.path.join(current_dir, "..", "async_tasks")
if async_tasks_path not in sys.path:
    sys.path.append(async_tasks_path)

try:
    from E012 import kanji_to_chome

except ImportError:
    sys.path.remove(async_tasks_path)
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
    from src.E001_DataMatching.E012 import kanji_to_chome

# Compile regex
RE_PREF = re.compile(r"(.*?[都道府県])")
RE_CITY = re.compile(r"[都道府県](.*?[市区郡])")
RE_TOWN = re.compile(r"[市区郡](.*?[町村])")
RE_AZA = re.compile(r"字([^0-9丁目-]+)")
RE_CHOME = re.compile(r"(\d+)丁目")
RE_BANGO = re.compile(r"(\d[\d\-]+)$")
RE_KANJI_CHOME = re.compile(r"([一二三四五六七八九十]+)丁目")


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
                replace_cost = dp[i - 1][j - 1] + (
                    1 if strA[i - 1] != strB[j - 1] else 0
                )
                dp[i][j] = min(insert_cost, delete_cost, replace_cost)

    invert_score = dp[N][M] / max(N, M)

    score = (100 - math.floor(invert_score * 100)) / 100

    return score


def get_town(address):
    m = RE_TOWN.search(address)
    if m:
        return m.group(1)
    m = re.match(r"(.*?[町村])", address)
    if m:
        return m.group(1)
    return ""


def get_parsed_town(m_town, parsed_data):
    if "city_district" in parsed_data:
        if "town" in parsed_data:
            return f"{parsed_data['town']}{parsed_data['city_district']}"
        else:
            return parsed_data["city_district"]
    else:
        return m_town if m_town else ""


def parse_address(addresses, pref_and_city):
    parsed_address = []
    for address in addresses:
        if address and str(address).lower() != "nan":
            try:
                if pref_and_city and pref_and_city not in address:
                    address = f"{pref_and_city}{address}"
                parsed = japanese_address.parse(address)
                if "unparsed_right" not in parsed:
                    parsed["block"] = ""
                else:
                    parsed["block"] = parsed["unparsed_right"]
                m_pref = RE_PREF.search(address)
                m_city = RE_CITY.search(address)
                m_town = get_town(address)
                m_aza = RE_AZA.search(address)
                m_chome = RE_CHOME.search(address)
                m_bango = RE_BANGO.search(address)
                address_parse = {
                    "prefecture": m_pref.group(1) if m_pref else "",
                    "city": m_city.group(1) if m_city else "",
                    "town": get_parsed_town(m_town, parsed),
                    "aza": m_aza.group(1) if m_aza else "",
                    "chome": m_chome.group(1) if m_chome else "",
                    "m_bango": m_bango.group(1) if m_bango else "",
                    "block": parsed["block"],
                    "full_address": address,
                }
            except:
                address_parse = {
                    "prefecture": "",
                    "city": "",
                    "town": "",
                    "aza": "",
                    "chome": "",
                    "m_bango": "",
                    "block": "",
                    "full_address": "",
                }
        else:
            address_parse = {
                "prefecture": "",
                "city": "",
                "town": "",
                "aza": "",
                "chome": "",
                "m_bango": "",
                "block": "",
                "full_address": "",
            }
        parsed_address.append(address_parse)
    return parsed_address


sub_parsed = None
levels = ["prefecture", "city", "town", "aza", "chome", "block"]
sub_grouped = None
similarity_cache = {}


def group_sub_by_town(sub_parsed):
    grouped = defaultdict(list)
    for idx, sub in enumerate(sub_parsed):
        key = sub.get("town", "")
        grouped[key].append((idx, sub))
    return grouped


def match_one_main(main_index, main_data):
    global sub_grouped, levels, similarity_cache
    match_similarity = 0.0
    matched_data = None
    new_main_address = None
    key = main_data.get("town", "")
    candidates = sub_grouped.get(key, [])
    if not candidates:
        candidates = sub_grouped.get("", [])
    for orig_sub_index, sub_data in candidates:
        new_sub_address = "".join(
            [sub_data.get(level, "") for level in levels if sub_data.get(level, "")]
        )
        if new_sub_address:
            if new_main_address is None:
                new_main_address = "".join(
                    [
                        main_data.get(level, "")
                        for level in levels
                        if sub_data.get(level, "")
                    ]
                )
                new_main_address = RE_KANJI_CHOME.sub(kanji_to_chome, new_main_address)

            cache_key = (new_main_address, new_sub_address)
            if cache_key in similarity_cache:
                similarity = similarity_cache[cache_key]
            else:
                dist = Levenshtein.distance(new_main_address, new_sub_address)
                max_len = max(len(new_main_address), len(new_sub_address))
                similarity = (100 - int(dist / max_len * 100)) / 100
                similarity_cache[cache_key] = similarity

            if similarity > match_similarity:
                match_similarity = round(similarity, 2)
                matched_data = {
                    "main_address": main_data["full_address"],
                    "sub_address": sub_data["full_address"],
                    "main_index": main_index,
                    "sub_index": orig_sub_index,
                    "score": match_similarity,
                }

            if match_similarity == 1.0:
                break

    if matched_data is None:
        matched_data = {
            "main_address": main_data["full_address"],
            "sub_address": "",
            "main_index": main_index,
            "sub_index": -1,
            "score": 0.0,
        }

    return matched_data


def matched_address(main_df, sub_df, output_dir, pref_and_city, batch_size=5000):
    global sub_parsed, sub_grouped
    max_workers = min(12, int(os.cpu_count() or 1) + 4)
    main_parsed_path = f"{output_dir}/main_parsed.pkl"
    if os.path.exists(main_parsed_path):
        with open(main_parsed_path, "rb") as f:
            main_parsed = pickle.load(f)
    else:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_main = executor.submit(parse_address, main_df, pref_and_city)
            main_parsed = future_main.result()
        with open(main_parsed_path, "wb") as f:
            pickle.dump(main_parsed, f)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_sub = executor.submit(parse_address, sub_df, pref_and_city)
        sub_parsed = future_sub.result()
    sub_grouped = group_sub_by_town(sub_parsed)

    results = []
    n = len(main_parsed)
    for batch_start in range(0, n, batch_size):
        batch_end = min(batch_start + batch_size, n)
        batch = main_parsed[batch_start:batch_end]
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [
                executor.submit(match_one_main, batch_start + i, main_data)
                for i, main_data in enumerate(batch)
            ]
            batch_results = [future.result() for future in futures]
            results.extend(batch_results)
    results = [r for r in results if r is not None]
    results.sort(key=lambda x: x["main_index"])
    return results
