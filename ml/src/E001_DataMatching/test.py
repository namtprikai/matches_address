from E014 import embedding_address

suido_csv = f"C:/Users/congv/Downloads/match_address/matches_address/test_data/data/suido_residence.csv"
juki_csv = f"C:/Users/congv/Downloads/match_address/matches_address/test_data/data/juki_residence.csv"
touki_csv = ''
geocoded_csv = f"C:/Users/congv/Downloads/match_address/matches_address/test_data/data/E016.csv"
akiya_csv = f"C:/Users/congv/Downloads\match_address\matches_address/1049545f-bb52-4287-b487-9432fe82b536/akiya_result_cleaned.csv"
output_path = f"C:/Users/congv/Downloads/match_address/matches_address/matching_data"
merge_base = 'suido_residence.csv'
threshold = 0.6
batch_size = 1000

def start(suido_csv, juki_csv, touki_csv, geocoded_csv, akiya_csv, output_path, merge_base, threshold, batch_size):
    if not geocoded_csv:
        print('geocoded_csv file not exist ')
        return
    if not suido_csv:
        print('suido_csv file not exist ')
        return
    if not juki_csv:
        print('juki_csv file not exist ')
        return
    if not akiya_csv:
        print('akiya_csv file not exist ')
        return

    result_path = ''
    message = ''

    # Compare geocoded_csv and juki_csv
    saved_file_path, msg = embedding_address(
        geocoded_csv,
        juki_csv,
        "address",
        "正規化住所",
        merge_base,
        f"{output_path}/geocoded_juki.csv",
        3,
        threshold,
        batch_size,
        None,
        None,
        ['ジオコーディングデータ', '住基'],
        50,
        0
    )
    result_path = saved_file_path
    message = msg

    # Compare geocoded_juki and suido_csv
    saved_file_path, msg = embedding_address(
        result_path,
        suido_csv,
        "address",
        "正規化住所",
        merge_base,
        f"{output_path}/geocoded_suido.csv",
        3,
        threshold,
        batch_size,
        None,
        None,
        ['ジオコーディングデータ', '住基'],
        50,
        0
    )
    result_path = saved_file_path
    message = msg

    if touki_csv:
        # Compare geocoded_suido and touki_csv
        saved_file_path, msg = embedding_address(
            result_path,
            touki_csv,
            "address",
            "正規化住所",
            merge_base,
            f"{output_path}/geocoded_touki.csv",
            3,
            threshold,
            batch_size,
            None,
            None,
            ['ジオコーディングデータ', '建物情報'],
            50,
            0
        )
        result_path = saved_file_path
        message = msg

    # Compare geocoded with akiya_csv
    saved_file_path, msg = embedding_address(
        result_path,
        akiya_csv,
        "address",
        "正規化住所",
        merge_base,
        f"{output_path}/matched_data.csv",
        3,
        threshold,
        batch_size,
        None,
        None,
        ['ジオコーディングデータ', '空き家調査'],
        50,
        0
    )
    result_path = saved_file_path
    message = msg

    # print(result_path)
    # print(message)

start(suido_csv, juki_csv, touki_csv, geocoded_csv, akiya_csv, output_path, merge_base, threshold, batch_size)
