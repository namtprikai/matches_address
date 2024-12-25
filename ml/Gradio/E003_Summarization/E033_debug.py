"""
# E033 データ出力機能 
* E002による判定結果及び集計結果をGISデータ形式（GeoJSON等の標準形式）及びテキスト形式（CSV等）で出力する機能。アセットのエクスポート機能を提供する。なお、エクスポート時に出力座標系を選択できるようにする。 
"""

import json
import logging
import os
import sys
import chardet
import geopandas as gpd
import gradio as gr
import pandas as pd
from shapely import wkt
from shapely.geometry import MultiPolygon, Polygon

# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# すべての関数をインポート
from E003_Summarization.E033 import *

# 一般的な座標系のリスト
COMMON_CRS = [
    "EPSG:4326 (WGS84)",
    "EPSG:3857 (Webメルカトル)",
    "EPSG:2443 (日本測地系2000 / 平面直角座標系 I)",
    "EPSG:2444 (日本測地系2000 / 平面直角座標系 II)",
    "EPSG:2445 (日本測地系2000 / 平面直角座標系 III)",
    "EPSG:2446 (日本測地系2000 / 平面直角座標系 IV)",
    "EPSG:2447 (日本測地系2000 / 平面直角座標系 V)",
    "EPSG:2448 (日本測地系2000 / 平面直角座標系 VI)",
    "EPSG:2449 (日本測地系2000 / 平面直角座標系 VII)",
    "EPSG:2450 (日本測地系2000 / 平面直角座標系 VIII)",
    "EPSG:2451 (日本測地系2000 / 平面直角座標系 IX)",
    "EPSG:2452 (日本測地系2000 / 平面直角座標系 X)",
    "EPSG:2453 (日本測地系2000 / 平面直角座標系 XI)",
    "EPSG:2454 (日本測地系2000 / 平面直角座標系 XII)",
    "EPSG:2455 (日本測地系2000 / 平面直角座標系 XIII)",
    "EPSG:2456 (日本測地系2000 / 平面直角座標系 XIV)",
    "EPSG:2457 (日本測地系2000 / 平面直角座標系 XV)",
    "EPSG:2458 (日本測地系2000 / 平面直角座標系 XVI)",
    "EPSG:2459 (日本測地系2000 / 平面直角座標系 ⅩVII)",
    "EPSG:2460 (日本測地系2000 / 平面直角座標系 ⅩVIII)",
    "EPSG:2461 (日本測地系2000 / 平面直角座標系 ⅩIX)",
    "カスタム"
]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def gradio_interface(input_file, output_format, crs_choice, custom_crs):
    """
    Gradioインターフェース用の関数

    Parameters
    ----------
    input_file : file
        入力ファイル（Gradioのファイルオブジェクト）
    output_format : str
        出力形式（'CSV' または 'GeoJSON'）
    crs_choice : str
        選択された座標系
    custom_crs : str
        カスタム座標系（crs_choiceが'カスタム'の場合に使用）

    Returns
    -------
    str
        処理結果のメッセージ
    """
    try:
        logging.info("Starting gradio_interface")
        
        # ファイルの存在確認
        if not os.path.exists(input_file.name):
            logging.error("The input file does not exist or cannot be accessed.")
            return None, "入力ファイルが見つかりませんでした。"
        
        logging.info(f"Reading input data from {input_file.name}")
        gdf = read_input_data(input_file.name)
        
        if crs_choice == "カスタム":
            target_crs = custom_crs
        else:
            target_crs = crs_choice.split(" ")[0]

        file_name_without_extension = os.path.splitext(os.path.basename(input_file.name))[0]
        output_file = "{}_{}.{}".format(file_name_without_extension, target_crs, output_format)

        params = {
            'input_file': input_file.name,
            'output_format': output_format,
            'target_crs': target_crs,
            'output_path': output_file
        }

        logging.info(f"Calling main function with params: {params}")
        result = processing(params)

        if isinstance(result, str) and result.startswith("An error occurred:"):
            logging.error(f"Error in processing: {result}")
            return None, result
        else:
            logging.info(f"Processing completed. Result: {result}")
            return result, "処理が完了しました。"
    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return None, f"エラーが発生しました: {str(e)}"

if __name__ == '__main__':
    # Gradioインターフェースの設定
    with gr.Blocks() as e033:
        with gr.Row():
            with gr.Column():
                file_input = gr.File(
                    label="csvファイルを入力してください", 
                    value="../E002_Classification/data/23211/E022/outputs/D902_2023.csv"  # デフォルト値を設定
                )
                citycode = gr.Dropdown(
                    label="市区町村コードを選択（23201:豊橋市、23211:豊田市）", 
                    choices=["23201", "23211"], 
                    value="23211", 
                    interactive=True
                )
                targetyear = gr.Dropdown(
                    label="対象年度を選択", 
                    choices=["2020", "2021", "2022", "2023", "2024"], 
                    value="2023", 
                    interactive=True
                )
                output_format = gr.Radio(
                    ["CSV", "GeoJSON"], 
                    value="GeoJSON", 
                    label="出力データ形式"
                )
                crs_choice = gr.Dropdown(
                    choices=COMMON_CRS, 
                    label="変換後の座標系を選択（プリセット）", 
                    value="EPSG:4326 (WGS84)",  
                    type="value"
                )
                custom_crs = gr.Textbox(
                    label="カスタム座標系 (例: EPSG:2249)", 
                    placeholder="EPSG:xxxx"
                )
                
                match_button = gr.Button("変換実行")
        
        output_file = gr.File(label="変換後データ")
        output_message = gr.Textbox(label="処理メッセージ")

        def on_submit(file, citycode_value, targetyear_value, output_format_value, crs_value, custom_crs_value):
            return gradio_interface(file, output_format_value, crs_value, custom_crs_value)

        match_button.click(
            fn=on_submit,
            inputs=[file_input, citycode, targetyear, output_format, crs_choice, custom_crs],
            outputs=[output_file, output_message]
        )
    
    # Gradioインターフェースの起動
    e033.launch()