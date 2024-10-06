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

# ログ設定
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
    # 受け取ったパラメータをログに記録
    logging.info(f"Received input: output_format={output_format}, crs_choice={crs_choice}, custom_crs={custom_crs}")
    
    # 座標系の選択に応じてtarget_crsを設定
    if crs_choice == "カスタム":
        target_crs = custom_crs
    else:
        # crs_choiceから座標系のコードを抽出（例: "EPSG:4326 WGS84" -> "EPSG:4326"）
        target_crs = crs_choice.split(" ")[0]

    directory = os.path.dirname(input_file)
    file_name_without_extension = os.path.splitext(os.path.basename(input_file))[0]

    output_file = "{}_{}.{}".format(file_name_without_extension, target_crs, output_format)

    # main関数に渡すパラメータを準備
    params = {
        'input_file': input_file,
        'output_format': output_format,
        'target_crs': target_crs,
        'output_path': output_file
    }
    
    # main関数の呼び出しとパラメータをログに記録
    logging.info(f"Calling main function with params: {params}")
    result = processing(params)

    # 処理結果の確認とログ記録
    if isinstance(result, str) and result.startswith("An error occurred:"):
        # エラーが発生した場合
        logging.error(f"Error in processing: {result}")
        return None, result
    else:
        # エラーが発生した場合
        logging.info(f"Processing completed. Result: {result}")
        return result, "処理が完了しました。"

if __name__ == '__main__':
    # Gradioインターフェースの定義
    iface = gr.Interface(
        fn=gradio_interface,
        inputs=[
            gr.File(label="【D902】空き家判定結果データ"),
            gr.Radio(["CSV", "GeoJSON"], label="出力データ形式"),
            gr.Dropdown(choices=COMMON_CRS, label="変換後の座標系を選択（プリセット）", type="value"),
            gr.Textbox(label="変換後の座標系を選択（プリセット以外の座標系の場合） (例: EPSG:2249)", placeholder="EPSG:xxxx")
        ],
        outputs=[
            gr.File(label="変換後データ"),
            gr.Textbox(label="処理メッセージ")
        ],
        title="E033 - データ出力機能",
        description="E022による判定結果及びE032による集計結果をGISデータ形式で出力する機能。エクスポート時に座標系を選択できます。"
    )
    
    # Gradioインターフェースの起動
    iface.launch()
