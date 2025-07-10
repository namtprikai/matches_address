from E014 import embedding_address

suido_csv = f"E:/1.Projects/geocoding_file/address-toyota/suido_residence.csv"
juki_csv = f"E:/1.Projects/geocoding_file/address-toyota/juki_residence.csv"
touki_csv = f"E:/1.Projects/geocoding_file/address-toyota/touki_residence.csv"
geocoded_csv = f"E:/1.Projects/geocoding_file/address-toyota/E016.csv"
output_path = f"E:/1.Projects/geocoding_file/address-toyota"
merge_base = 'suido_residence.csv'
threshold = 0.2
batch_size = 1000,

# 'juki': '住基',
# 'suido_status': '水道',
# 'touki': '建物情報',
# 'akiya_result': '空き家調査',
# 'geocoding': 'ジオコーディングデータ',
def start(suido_csv, juki_csv, touki_csv, geocoded_csv, output_path, merge_base, threshold, batch_size):
    if not geocoded_csv:
        print('geocoded_csv file not exist ')
        return
    if not suido_csv:
        print('suido_csv file not exist ')
        return
    if not juki_csv:
        print('juki_csv file not exist ')
        return

    result_path = ''
    message = ''
    result_column_name = ''

    # Handle geocoded_csv, suido_csv
    saved_file_path, address_column, msg = embedding_address(
        suido_csv,
        geocoded_csv,
        "正規化住所",
        "address",
        merge_base,
        f"{output_path}/step_1.csv",
        3,
        threshold,
        batch_size,
        None,
        None,
        ['水道', 'ジオコーディングデータ'],
        50,
        0
    )
    result_path = saved_file_path
    result_column_name = address_column
    message = msg

    print(result_path, '////')

    # Handle juki, step_1
    saved_file_path, address_column, msg = embedding_address(
        juki_csv,
        result_path,
        "正規化住所",
        result_column_name,
        merge_base,
        f"{output_path}/step_2.csv",
        3,
        threshold,
        batch_size,
        None,
        None,
        ['水道', 'ジオコーディングデータ'],
        50,
        0
    )
    result_path = saved_file_path
    message = msg
    result_column_name = address_column

    if touki_csv:
        # Handle touki, step_2
        saved_file_path, address_column, msg = embedding_address(
            touki_csv,
            result_path,
            "正規化住所",
            result_column_name,
            merge_base,
            f"{output_path}/matched_data.csv",
            3,
            threshold,
            batch_size,
            None,
            None,
            ['水道', 'ジオコーディングデータ'],
            50,
            0
        )
        result_path = saved_file_path
        message = msg
    
    print(result_path)
    print(message)

start(suido_csv, juki_csv, touki_csv, geocoded_csv, output_path, merge_base, threshold, batch_size)
