"""
# E032 地域集計機能
* 町丁字単位等の地域単位での集計を実施。
* 空き家判定データとユーザーがアップロードした地域ポリゴンデータを結合し、地域単位で集計し、新規アセットとして保存する機能を提供する。この際、ポリゴンとポリゴンの交差判定を行い、複数のポリゴンにまたがる場合には建物ポリゴンと交差する面積の割合が多いポリゴンへ集計されることとする。
"""

import numpy
import pandas as pd
import geopandas as gpd
import os
import shutil
import tempfile
import gradio as gr
import sqlite3
import zipfile 
import sys
from shapely.geometry import MultiPolygon, Polygon
from shapely.wkt import loads as load_wkt
from datetime import datetime
# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E032.pyからすべての関数をインポート
from E003_Summarization.E032 import *


def process_summarization_gradio(akiya_pred_file, spatial_file, key_column):
    """
    メイン関数(Gradioのみ)　Summarization を実行
    """
    # print('現状のディレクトリ：')
    # print(os.getcwd())
    temp_dir = os.path.join(os.getcwd(), "temp_files/E032")
    os.makedirs(temp_dir, exist_ok=True)
    process_summarization(akiya_pred_file, spatial_file, temp_dir, key_column)


    # # 空き家判定ファイルを移動
    # akiya_pred_path = move_uploaded_file(akiya_pred_file, temp_dir)

    # # ファイル拡張子を取得
    # file_ext = os.path.splitext(spatial_file.name)[1].lower()

    # if file_ext == ".zip":
    #     # zipファイルを解凍して Shapefile を取得
    #     shp_file = extract_zip(spatial_file, temp_dir)
    #     input_paths = {
    #         "akiya_pred": akiya_pred_path,
    #         "city_block": shp_file  # Shapefile のパスを直接格納
    #     }

    # elif file_ext == ".gpkg":
    #     # GeoPackageファイルをそのまま使用
    #     gpkg_path = move_uploaded_file(spatial_file, temp_dir)
    #     input_paths = {
    #         "akiya_pred": akiya_pred_path,
    #         "city_block": gpkg_path
    #     }

    # elif file_ext == ".geojson":
    #     # GeoJSONファイルをそのまま使用
    #     geojson_path = move_uploaded_file(spatial_file, temp_dir)
    #     input_paths = {
    #         "akiya_pred": akiya_pred_path,
    #         "city_block": geojson_path
    #     }

    # elif file_ext == ".csv":
    #     # CSVファイルをそのまま使用（WKTフォーマット）
    #     csv_path = move_uploaded_file(spatial_file, temp_dir)
    #     input_paths = {
    #         "akiya_pred": akiya_pred_path,
    #         "city_block": csv_path
    #     }

    # else:
    #     raise ValueError(f"Unsupported file format: {file_ext}")

    # # 出力ファイルのパスを設定
    output_path = os.path.join(os.getcwd(), "temp_files/E032.csv")
    # Summarization(input_paths, output_path, key_column).process()

    return output_path

def get_columns_from_file(file):
    """
    アップロードされたファイルからカラム名を取得し、リストで返す関数。
    """
    temp_dir = os.path.join(os.getcwd(), "temp_files/E032")
    os.makedirs(temp_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.name)[1].lower()
    
    if file_ext == ".zip":
        # zipファイルを解凍して .shp ファイルを使用
        shp_file = extract_zip(file, temp_dir)
        gdf = gpd.read_file(shp_file)
        # shapefileを探す
        gdf = gpd.read_file(shp_file)
        print(f"以下のカラムを読み取りました: {gdf.columns}")
    elif file_ext == ".gpkg":
        # GeoPackageファイルを読み込む
        gdf = gpd.read_file(file)
    elif file_ext == ".geojson":
        # GeoJSONファイルを読み込む
        gdf = gpd.read_file(file)
    elif file_ext == ".csv":
        # CSVファイルを読み込む
        df = pd.read_csv(file)
        return list(df.columns)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")
    
    return list(gdf.columns)

# Gradioインターフェース
def update_key_column_choices(spatial_file):
    print(f"File passed to update_key_column_choices: {spatial_file.name}")
    # ファイルからカラムを取得
    columns = get_columns_from_file(spatial_file)
    return gr.update(choices=columns)

if __name__ == "__main__":
    # gradioインターフェースの作成
    with gr.Blocks() as iface:
        akiya_pred_file = gr.File(
            label="【D902】空き家判定結果データを入力してください", 
            value="../E002_Classification/data/23201/E022/outputs/D902_2023.csv",  # デフォルト値を設定
            file_types=[".zip", ".gpkg", ".geojson", ".csv"]
            )
        spatial_file = gr.File(
            label="【D013】国勢調査小地域データ（町丁・字等）", 
            value="./data/23211/E032/inputs/models.zip", 
            file_types=[".zip", ".gpkg", ".geojson", ".csv"]
            )
        key_column = gr.Dropdown(
            label="集計に使用するカラム", 
            value="KEY_CODE", 
            choices=[]
            )

        # ファイルがアップロードされたときにカラム選択肢を更新
        spatial_file.change(fn=update_key_column_choices, inputs=spatial_file, outputs=key_column)

        submit = gr.Button("実行")
        output_file = gr.File(label="【D903】地域別集計データ")

        submit.click(
            fn=process_summarization_gradio,
            inputs=[akiya_pred_file, spatial_file, key_column],
            outputs=output_file
        )

    iface.launch()

