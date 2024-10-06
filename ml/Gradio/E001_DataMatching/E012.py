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
    geocoding_address, geocoding_lat, geocoding_lon
):
    """
    すべてのデータファイルを処理する
    """

    INPUT_COLUMNS = set_columns(
        suido_number, usage_status, suido_status_address, usage_start_date, usage_end_date,
        suido_number2, meter_reading_date, suido_usage,
        setai_code, juki_address, birth, gender, move_date,
        touki_address, structure, registration_date,
        akiya_result_ID, akiya_result_address, akiya_result_lat, akiya_result_lon,
        geocoding_address, geocoding_lat, geocoding_lon
    )

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
    suido_use_df.to_csv("{}/E012/{}/outputs/processed_suido_use.csv".format(citycode, targetyear), index=False)
    touki_df.to_csv("{}/E012/{}/outputs/processed_touki.csv".format(citycode, targetyear), index=False)
    geocoding_df.to_csv("{}/E012/{}/outputs/processed_geocoding.csv".format(citycode, targetyear), index=False)
    akiya_result_df.to_csv("{}/E012/{}/outputs/processed_akiya_result.csv".format(citycode, targetyear), index=False)

    # 入力ファイルのパスを設定
    input_paths = {
        "suido_status": suido_status_file,
        "suido_use": "{}/E012/{}/outputs/processed_suido_use.csv".format(citycode, targetyear),
        "juki": juki_file,
        "touki": "{}/E012/{}/outputs/processed_touki.csv".format(citycode, targetyear),
        "akiya_result": "{}/E012/{}/outputs/processed_akiya_result.csv".format(citycode, targetyear),
        "geocoding": "{}/E012/{}/outputs/processed_geocoding.csv".format(citycode, targetyear)
    }
    
    # 出力ファイルのパスを設定
    # 処理後のファイルの保存先パスを辞書形式で定義
    output_paths = {
        "suido_status": "{}/E012/{}/outputs/suido_status_cleaned.csv".format(citycode, targetyear),
        "suido_use": "{}/E012/{}/outputs/suido_use_cleaned.csv".format(citycode, targetyear),
        "juki": "{}/E012/{}/outputs/juki_cleaned.csv".format(citycode, targetyear),
        "touki": "{}/E012/{}/outputs/touki_cleaned.csv".format(citycode, targetyear),
        "akiya_result": "{}/E012/{}/outputs/akiya_result_cleaned.csv".format(citycode, targetyear),
        "geocoding": "{}/E012/{}/outputs/geocoding_cleaned.csv".format(citycode, targetyear)
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

    os.remove("{}/E012/{}/outputs/processed_suido_use.csv".format(citycode, targetyear), index=False)
    os.remove("{}/E012/{}/outputs/processed_touki.csv".format(citycode, targetyear), index=False)
    os.remove("{}/E012/{}/outputs/processed_geocoding.csv".format(citycode, targetyear), index=False)
    os.remove("{}/E012/{}/outputs/processed_akiya_result.csv".format(citycode, targetyear), index=False)

    print("すべての処理が完了しました!")

    # 処理済みファイルのパスリストを返す
    # 出力パスのうち、実際にファイルが生成されたもののみをリストにして返す
    return [path for path in output_paths.values() if os.path.exists(path)]



# Gradio UIの構築
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
    with gr.Row():
        with gr.Column():
            suido_status_file = gr.File(label="水道ステータスデータ", file_types=[".csv", ".xlsx", ".xls"])
            suido_number_dropdown = gr.Dropdown(label="水道番号", choices=[], interactive=True)
            usage_status_dropdown = gr.Dropdown(label="開閉栓区分", choices=[], interactive=True)
            suido_status_address_dropdown = gr.Dropdown(label="設置場所", choices=[], interactive=True)
            usage_start_date_dropdown = gr.Dropdown(label="使用開始日", choices=[], interactive=True)
            usage_end_date_dropdown = gr.Dropdown(label="使用中止日", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            suido_status_file.change(
                fn=partial(update_dropdown, filekey="suido_status"),  # partial関数でfilekeyを渡す
                inputs=[suido_status_file],  # GradioのFileコンポーネントを渡す
                outputs=[suido_number_dropdown, usage_status_dropdown, suido_status_address_dropdown, usage_start_date_dropdown, usage_end_date_dropdown]
            )

        with gr.Column():
            suido_use_file = gr.File(label="水道使用量データ", file_types=[".csv", ".xlsx", ".xls"])
            suido_number2_dropdown = gr.Dropdown(label="水道番号のカラム名", choices=[], interactive=True)
            meter_reading_date_dropdown = gr.Dropdown(label="検針年月日のカラム名", choices=[], interactive=True)
            suido_usage_dropdown = gr.Dropdown(label="水道使用量のカラム名", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            suido_use_file.change(
                fn=partial(update_dropdown, filekey="suido_use"),  # partial関数でfilekeyを渡す
                inputs=[suido_use_file],  # GradioのFileコンポーネントを渡す
                outputs=[suido_number2_dropdown, meter_reading_date_dropdown, suido_usage_dropdown]
            )

    with gr.Row():
        with gr.Column():
            juki_file = gr.File(label="住基データ", file_types=[".csv", ".xlsx", ".xls"])
            setai_code_dropdown = gr.Dropdown(label="世帯コード", choices=[], interactive=True)
            juki_address_dropdown = gr.Dropdown(label="住所", choices=[], interactive=True)
            birth_dropdown = gr.Dropdown(label="生年月日", choices=[], interactive=True)
            gender_dropdown = gr.Dropdown(label="性別", choices=[], interactive=True)
            move_date_dropdown = gr.Dropdown(label="住定異動年月日", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            juki_file.change(
                fn=partial(update_dropdown, filekey="juki"),  # partial関数でfilekeyを渡す
                inputs=[juki_file],  # GradioのFileコンポーネントを渡す
                outputs=[setai_code_dropdown, juki_address_dropdown, birth_dropdown, gender_dropdown, move_date_dropdown]
            )

        with gr.Column():
            akiya_result_file = gr.File(label="空き家結果データ", file_types=[".csv", ".xlsx", ".xls"])
            akiya_result_ID_dropdown = gr.Dropdown(label="ID", choices=[], interactive=True)
            akiya_result_address_dropdown = gr.Dropdown(label="住所", choices=[], interactive=True)
            akiya_result_lat_dropdown = gr.Dropdown(label="緯度", choices=[], interactive=True)
            akiya_result_lon_dropdown = gr.Dropdown(label="経度", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            akiya_result_file.change(
                fn=partial(update_dropdown, filekey="akiya_result"),  # partial関数でfilekeyを渡す
                inputs=[akiya_result_file],  # GradioのFileコンポーネントを渡す
                outputs=[akiya_result_ID_dropdown, akiya_result_address_dropdown, akiya_result_lat_dropdown, akiya_result_lon_dropdown]
            )

    with gr.Row():
        with gr.Column():
            geocoding_file = gr.File(label="ジオコーディングデータ", file_types=[".csv", ".xlsx", ".xls"])
            geocoding_address_dropdown = gr.Dropdown(label="住所", choices=[], interactive=True)
            geocoding_lat_dropdown = gr.Dropdown(label="緯度", choices=[], interactive=True)
            geocoding_lon_dropdown = gr.Dropdown(label="経度", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            geocoding_file.change(
                fn=partial(update_dropdown, filekey="geocoding"),  # partial関数でfilekeyを渡す
                inputs=[geocoding_file],  # GradioのFileコンポーネントを渡す
                outputs=[geocoding_address_dropdown, geocoding_lat_dropdown, geocoding_lon_dropdown]
            )

        with gr.Column():
            touki_file = gr.File(label="登記データ", file_types=[".csv", ".xlsx", ".xls"])
            touki_address_dropdown = gr.Dropdown(label="住所", choices=[], interactive=True)
            structure_dropdown = gr.Dropdown(label="登記構造", choices=[], interactive=True)
            registration_date_dropdown = gr.Dropdown(label="登記日付", choices=[], interactive=True)

            # ファイルが変更されたらドロップダウンを更新
            touki_file.change(
                fn=partial(update_dropdown, filekey="touki"),  # partial関数でfilekeyを渡す
                inputs=[touki_file],  # GradioのFileコンポーネントを渡す
                outputs=[touki_address_dropdown, structure_dropdown, registration_date_dropdown]
            )

    submit_button = gr.Button("処理を実行")

    # 出力ファイルセクション
    with gr.Row():
        suido_status_output = gr.File(label="Processed Suido Status Data")
        suido_use_output = gr.File(label="Processed Suido Use Data")
        juki_output = gr.File(label="Processed Juki Data")
        touki_output = gr.File(label="Processed Touki Data")
        akiya_result_output = gr.File(label="Processed Akiya Result Data")
        geocoding_output = gr.File(label="Processed Geocoding Data")

    
    submit_button.click(
        fn=process_data_gradio,
        inputs=[
            main_data_type, suido_number_dropdown, usage_status_dropdown, suido_status_address_dropdown, usage_start_date_dropdown, usage_end_date_dropdown,
            suido_number2_dropdown, meter_reading_date_dropdown, suido_usage_dropdown,
            setai_code_dropdown, juki_address_dropdown, birth_dropdown, gender_dropdown, move_date_dropdown,
            touki_address_dropdown, structure_dropdown, registration_date_dropdown,
            akiya_result_ID_dropdown, akiya_result_address_dropdown, akiya_result_lat_dropdown, akiya_result_lon_dropdown,
            geocoding_address_dropdown, geocoding_lat_dropdown, geocoding_lon_dropdown
        ],
        outputs=[
            suido_status_output, suido_use_output, juki_output, touki_output, akiya_result_output, geocoding_output
        ]
    )


demo.launch()
