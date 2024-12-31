"""
# E012 名寄せ機能
* アップロードされた住所カラムに該当するすべての列の名寄せ（住所の正規化）をする機能
"""

import os
import re
import unicodedata
import sys
import chardet
import gradio as gr
import pandas as pd
from functools import partial
# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E012.pyからすべての関数をインポート
from E001_DataMatching.E012 import *



def load_column_names(file, filekey):
    if file is not None:
        try:
            # ファイルの拡張子に応じて処理を分岐
            file_extension = file.split('.')[-1].lower()
            if file_extension == 'csv':
                try:
                    df = read_file(file, filekey)
                    if df is not None:
                        return df.columns.tolist()
                    else:
                        print("ファイルの読み込みに失敗しました。")
                        return []
                except Exception as e:
                    print(f"カラムの読み込み中にエラーが発生しました: {e}")

            elif file_extension in ['xlsx', 'xls']:
                df = pd.read_excel(file)
            else:
                print(f"サポートされていないファイル形式です: {file_extension}")
                return []
            # 正常に読み込まれた場合、カラム名のリストを返す
            return df.columns.tolist()
        except Exception as e:
            print(f"カラムの読み込み中にエラーが発生しました: {e}")
            return []
    return []

def update_dropdown(file, filekey):
    """
    ファイルのカラム名を取得して、すべての関連するドロップダウンを更新する
    """
    if file is not None:
        columns = load_column_names(file, filekey)
        # すべての関連ドロップダウンを更新するために複数の返り値を作成
        return (
            gr.update(choices=columns),  # 第一のドロップダウン
            gr.update(choices=columns),  # 第二のドロップダウン
            gr.update(choices=columns),  # 第三のドロップダウン
            gr.update(choices=columns),  # 第四のドロップダウン
            gr.update(choices=columns)   # 第五のドロップダウン
        )
    # ファイルがない場合、すべてのドロップダウンを空の選択肢に設定
    return (
        gr.update(choices=[]), 
        gr.update(choices=[]), 
        gr.update(choices=[]), 
        gr.update(choices=[]), 
        gr.update(choices=[])
    )

#suido_status_file, suido_use_file, juki_file, touki_file, akiya_result_file, geocoding_file
def process_data_gradio(main_data_type,
    suido_number, usage_status, suido_status_address, usage_start_date, usage_end_date,
    suido_number2, meter_reading_date, suido_usage,
    setai_code, juki_address, birth, gender, move_date,
    touki_address, structure, registration_date,
    akiya_result_ID, akiya_result_address, akiya_result_lat, akiya_result_lon,
    geocoding_address, geocoding_lat, geocoding_lon, citycode, targetyear
):
    """
    すべてのデータファイルを処理する
    """

    suido_status_file = "data/{}/E012/inputs/suido_status.csv".format(citycode)
    suido_use_file = "data/{}/E012/inputs/suido_use_{}.csv".format(citycode, targetyear)
    juki_file = "data/{}/E012/inputs/juki_{}.csv".format(citycode, targetyear)
    touki_file = "data/{}/E012/inputs/touki.csv".format(citycode)
    akiya_result_file = "data/{}/E012/inputs/akiya_result.csv".format(citycode)
    geocoding_file = "data/{}/E012/inputs/geocoding.csv".format(citycode)

    INPUT_COLUMNS = set_columns(
        suido_number, usage_status, suido_status_address, usage_start_date, usage_end_date,
        suido_number2, meter_reading_date, suido_usage,
        setai_code, juki_address, birth, gender, move_date,
        touki_address, structure, registration_date,
        akiya_result_ID, akiya_result_address, akiya_result_lat, akiya_result_lon,
        geocoding_address, geocoding_lat, geocoding_lon
    )
    set_output_column()

    # メインデータを決定
    if main_data_type == "suido_status":
        main_df = read_file(suido_status_file, "suido_status")
        main_address_col = suido_status_address
    elif main_data_type == "juki":
        main_df = read_file(juki_file, "juki")
        main_address_col = juki_address
    
    #main_df = pd.read_csv(suido_status_file, encoding="shift_jis")
    #print(main_df, main_data_type, suido_status_file)
    # ファイルのパスまたはダミーデータの生成
    suido_status_df = handle_optional_file(suido_status_file, "suido_status",main_df, main_address_col, INPUT_COLUMNS)
    suido_use_df = handle_optional_file(suido_use_file, "suido_use",main_df, main_address_col, INPUT_COLUMNS)
    juki_df = handle_optional_file(juki_file, "juki",main_df, main_address_col, INPUT_COLUMNS)
    touki_df = handle_optional_file(touki_file, "touki",main_df, main_address_col, INPUT_COLUMNS)
    akiya_result_df = handle_optional_file(akiya_result_file, "akiya_result",main_df, main_address_col, INPUT_COLUMNS)
    geocoding_df = handle_optional_file(geocoding_file, "geocoding",main_df, main_address_col, INPUT_COLUMNS)
    #print(geocoding_df)
    



    # geocodingデータがない場合、生成されたダミーデータにgeocoding_latとgeocoding_lonが含まれているか確認
    if geocoding_file is None:
        print("生成されたgeocodingダミーデータ:")
        print(geocoding_df.head())

    # akiya_resultは必須とするため、ファイルがない場合はエラー
    if akiya_result_file is None:
        raise ValueError("空き家結果データは必須です。")
    
    # akiya_resultファイルの読み込み
    akiya_result_df = read_file(akiya_result_file, "akiya_result")

    # ファイルを保存して、処理に反映
    suido_use_df.to_csv("data/{}/E012/outputs/processed_suido_use_{}.csv".format(citycode, targetyear), index=False)
    touki_df.to_csv("data/{}/E012/outputs/processed_touki.csv".format(citycode), index=False)
    geocoding_df.to_csv("data/{}/E012/outputs/processed_geocoding.csv".format(citycode), index=False)
    akiya_result_df.to_csv("data/{}/E012/outputs/processed_akiya_result.csv".format(citycode), index=False)

    # 入力ファイルのパスを設定
    input_paths = {
        "suido_status": suido_status_file,
        "suido_use": "data/{}/E012/outputs/processed_suido_use_{}.csv".format(citycode, targetyear),
        "juki": juki_file,
        "touki": "data/{}/E012/outputs/processed_touki.csv".format(citycode),
        "akiya_result": "data/{}/E012/outputs/processed_akiya_result.csv".format(citycode),
        "geocoding": "data/{}/E012/outputs/processed_geocoding.csv".format(citycode)
    }
    
    # 出力ファイルのパスを設定
    # 処理後のファイルの保存先パスを辞書形式で定義
    output_paths = {
        "suido_status": "data/{}/E012/outputs/suido_status_cleaned_{}.csv".format(citycode, targetyear),
        "suido_use": "data/{}/E012/outputs/suido_use_cleaned_{}.csv".format(citycode, targetyear),
        "juki": "data/{}/E012/outputs/juki_cleaned_{}.csv".format(citycode, targetyear),
        "touki": "data/{}/E012/outputs/touki_cleaned.csv".format(citycode),
        "akiya_result": "data/{}/E012/outputs/akiya_result_cleaned.csv".format(citycode),
        "geocoding": "data/{}/E012/outputs/geocoding_cleaned.csv".format(citycode)
    }
    
    # EachFileProcessorインスタンスを作成
    # 入力パスと出力パスを引数として、ファイル処理用のオブジェクトを生成
    processor = EachFileProcessor(input_paths, output_paths)
    
    # 各データファイルを順番に処理
    for file_key in input_paths.keys():
        # 処理中のファイル名を表示
        print(f"{file_key}データを処理中...")
        # EachFileProcessorのprocess_fileメソッドを呼び出して各ファイルを処理
        processor.process_file(file_key)

    #os.remove("data/{}/E012/outputs/processed_suido_use_{}.csv".format(citycode, targetyear), index=False)
    #os.remove("data/{}/E012/outputs/processed_touki_{}.csv".format(citycode, targetyear), index=False)
    #os.remove("data/{}/E012/outputs/processed_geocoding.csv".format(citycode), index=False)
    #os.remove("data/{}/E012/outputs/processed_akiya_result_{}.csv".format(citycode, targetyear), index=False)

    print("すべての処理が完了しました!")

    # 処理済みファイルのパスリストを返す
    # 出力パスのうち、実際にファイルが生成されたもののみをリストにして返す
    return [path for path in output_paths.values() if os.path.exists(path)]




with gr.Blocks() as demo:
    gr.Markdown("# E12 - データクレンジング機能")
    gr.Markdown("アップロードされた初期データを正規化する機能")
    with gr.Row():
        with gr.Column():
            main_data_type = gr.Dropdown(
                label="メインとなるデータを選択", 
                choices=["suido_status", "juki"], 
                value="juki", 
                interactive=True
            )

            citycode = gr.Dropdown(
                label="市区町村コードを選択（23201:豊橋市、23211:豊田市）", 
                choices=["23201", "23211"], 
                value="23201", 
                interactive=True
            )

            targetyear = gr.Dropdown(
                label="対象年度を選択", 
                choices=["2020", "2021", "2022", "2023", "2024"], 
                value="2023", 
                interactive=True
            )

    with gr.Row():
        with gr.Column():
            # ここでカラムを固定する代わりに、Gradioのコンポーネントとしてカラムを設定
            suido_number_dropdown = gr.Dropdown(label="水道番号", choices=["水道番号"], value="水道番号")
            usage_status_dropdown = gr.Dropdown(label="開閉栓区分", choices=["開閉栓区分"], value="開閉栓区分")
            suido_status_address_dropdown = gr.Dropdown(label="設置場所", choices=["設置場所"], value="設置場所")
            #suido_status_address_dropdown = gr.Dropdown(label="設置場所", choices=["住所"], value="住所")
            usage_start_date_dropdown = gr.Dropdown(label="使用開始日", choices=["使用開始日"], value="使用開始日")
            usage_end_date_dropdown = gr.Dropdown(label="使用中止日", choices=["使用中止日"], value="使用中止日")

        with gr.Column():
            suido_number2_dropdown = gr.Dropdown(label="水道番号のカラム名", choices=["水道番号"], value="水道番号")
            meter_reading_date_dropdown = gr.Dropdown(label="検針年月日のカラム名", choices=["検針年月日"], value="検針年月日")
            suido_usage_dropdown = gr.Dropdown(label="水道使用量のカラム名", choices=["水道使用量"], value="水道使用量")

    with gr.Row():
        with gr.Column():
            setai_code_dropdown = gr.Dropdown(label="世帯コード", choices=["世帯コード"], value="世帯コード")
            juki_address_dropdown = gr.Dropdown(label="住所", choices=["住所"], value="住所")
            birth_dropdown = gr.Dropdown(label="生年月日", choices=["生年月日"], value="生年月日")
            gender_dropdown = gr.Dropdown(label="性別", choices=["性別"], value="性別")
            move_date_dropdown = gr.Dropdown(label="住定異動年月日", choices=["住定異動年月日"], value="住定異動年月日")

        with gr.Column():
            akiya_result_ID_dropdown = gr.Dropdown(label="ID", choices=["ID"], value="ID")
            akiya_result_address_dropdown = gr.Dropdown(label="住所", choices=["住所"], value="住所")
            akiya_result_lat_dropdown = gr.Dropdown(label="緯度", choices=["緯度"], value="緯度")
            akiya_result_lon_dropdown = gr.Dropdown(label="経度", choices=["経度"], value="経度")

    with gr.Row():
        with gr.Column():
            geocoding_address_dropdown = gr.Dropdown(label="住所", choices=["住所"], value="住所")
            geocoding_lat_dropdown = gr.Dropdown(label="緯度", choices=["緯度"], value="緯度")
            geocoding_lon_dropdown = gr.Dropdown(label="経度", choices=["経度"], value="経度")

        with gr.Column():
            touki_address_dropdown = gr.Dropdown(label="住所", choices=["住所"], value="住所")
            structure_dropdown = gr.Dropdown(label="登記構造", choices=["登記構造"], value="登記構造")
            registration_date_dropdown = gr.Dropdown(label="登記日付", choices=["登記日付"], value="登記日付")

    submit_button = gr.Button("処理を実行")


    # 出力ファイルセクション
    with gr.Row():
        suido_status_output = gr.File(label="Processed Suido Status Data")
        suido_use_output = gr.File(label="Processed Suido Use Data")
        juki_output = gr.File(label="Processed Juki Data")
        touki_output = gr.File(label="Processed Touki Data")
        akiya_result_output = gr.File(label="Processed Akiya Result Data")
        geocoding_output = gr.File(label="Processed Geocoding Data")

    # デバッグ時は固定のファイルとカラムを使用
    submit_button.click(
        fn=process_data_gradio,
        inputs=[
            main_data_type, suido_number_dropdown, usage_status_dropdown, suido_status_address_dropdown, usage_start_date_dropdown, usage_end_date_dropdown,
            suido_number2_dropdown, meter_reading_date_dropdown, suido_usage_dropdown,
            setai_code_dropdown, juki_address_dropdown, birth_dropdown, gender_dropdown, move_date_dropdown,
            touki_address_dropdown, structure_dropdown, registration_date_dropdown,
            akiya_result_ID_dropdown, akiya_result_address_dropdown, akiya_result_lat_dropdown, akiya_result_lon_dropdown,
            geocoding_address_dropdown, geocoding_lat_dropdown, geocoding_lon_dropdown, citycode, targetyear
        ],
        outputs=[
            suido_status_output, suido_use_output, juki_output, touki_output, akiya_result_output, geocoding_output
        ]
    )

demo.launch()