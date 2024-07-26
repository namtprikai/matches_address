"""
# E032 地域集計機能
* 町丁字単位等の地域単位での集計を実施。
* 空き家判定データとユーザーがアップロードした地域ポリゴンデータを結合し、地域単位で集計し、新規アセットとして保存する機能を提供する。この際、ポリゴンとポリゴンの交差判定を行い、複数のポリゴンにまたがる場合には建物ポリゴンと交差する面積の割合 が多いポリゴンへ集計されることとする。
"""

import os
import shutil
import tempfile

import chardet
import geopandas as gpd
import gradio as gr
import numpy as np
import pandas as pd
from shapely.geometry import MultiPolygon, Polygon
from shapely.wkt import loads as load_wkt
 
class Summarization:
    def __init__(self, input_paths, output_path):
        # 入力ファイルのパスを設定
        self.INPUT_PATHS = input_paths
        # 出力ファイルのパスを設定
        self.OUTPUT_PATH = output_path
        
    # 各データで使用するカラムを定義
    INPUT_COLUMNS = {
        "akiya_pred": {
            "setai_code": "世帯コード",
            "pred": "pred",
            "akiya_geometry": "geometry"
            },
        "city_block": {
            "KEY_CODE": "KEY_CODE",
            "PREF_NAME": "PREF_NAME",
            "CITY_NAME": "CITY_NAME",
            "S_NAME": "S_NAME",
            "city_block_geometry": "geometry"
            }
    }
        
    # 出力するデータのカラムを定義
    OUTPUT_COLUMNS = [
        "KEY_CODE",
        "PREF_NAME",
        "CITY_NAME",
        "S_NAME",
        "建物戸数",
        "空き家数",
        "空き家率",
        "geometry"
    ]

    @staticmethod
    def read_file(path, **kwargs):
        """
        ファイルを読み込むメソッド
        
        Parameters
        ----------
        path : str
            読み込むファイルのパス
        **kwargs : dict
            ファイル読み込み時の追加パラメータ
        
        Returns
        -------
        df : pandas.DataFrame or geopandas.GeoDataFrame
            読み込んだデータフレーム
        """
        try:
            file_type = os.path.splitext(path)[1].lower()
            if file_type == ".csv":
                # エンコーディングを自動検出
                with open(path, 'rb') as file:
                    raw_data = file.read()
                    result = chardet.detect(raw_data)
                    encoding = result['encoding']
                
                # 検出されたエンコーディングでファイルを読み込む
                return pd.read_csv(path, encoding=encoding, **kwargs)
            elif file_type == ".shp":
                return gpd.read_file(path, **kwargs)
            
        except Exception as e:
            print(f"Error reading file {path}: {e}")
    
    @staticmethod
    def save_csv(df, path, encoding='shift_jis'):
        """
        CSVファイルを保存するメソッド
        
        Parameters
        ----------
        df : pandas.DataFrame
            保存するデータフレーム
        path : str
            保存先のファイルパス
        encoding : str, optional
            ファイルのエンコーディング（デフォルトは'shift_jis'）
        
        Returns
        -------
        None
        """
        encodings = ['shift_jis', 'cp932', 'utf-8']
        
        for enc in encodings:
            try:
                df.to_csv(path, encoding=enc, index=False)
                print(f"File saved successfully: {path} (encoding: {enc})")
                return
            except Exception as e:
                print(f"Error saving file {path} with encoding {enc}: {e}")
        
        print(f"Failed to save file {path} with any of the specified encodings.")
    
    def remove_z_coordinate(self, geometry):
        """
        ジオメトリからZ座標を削除するメソッド
        
        Parameters
        ----------
        geometry : shapely.geometry
            Z座標を含むジオメトリオブジェクト
        
        Returns
        -------
        geometry : shapely.geometry
            Z座標を削除したジオメトリオブジェクト
        """
        if geometry.geom_type == 'Polygon':
            # ポリゴンのZ座標を削除
            return Polygon([(x, y) for x, y, z in geometry.exterior.coords])
        elif geometry.geom_type == 'MultiPolygon':
            new_polygons = []
            for poly in geometry.geoms:
                # 各ポリゴンのZ座標を削除
                new_polygons.append(Polygon([(x, y) for x, y, z in poly.exterior.coords]))
            # 新しいマルチポリゴンを作成
            return MultiPolygon(new_polygons)
        else:
            return geometry
     
    def spatial_join(self, akiya_pred_gdf, city_block_gdf):
        """
        空間結合を行うメソッド
        
        Parameters
        ----------
        akiya_pred_gdf : geopandas.GeoDataFrame
            空き家予測データのGeoDataFrame
        city_block_gdf : geopandas.GeoDataFrame
            小地域データのGeoDataFrame
        
        Returns
        -------
        spatial_join_gdf : geopandas.GeoDataFrame
            空間結合後のGeoDataFrame
        """
        cols = self.INPUT_COLUMNS["akiya_pred"]
        
        # 空間結合
        spatial_join_gdf = gpd.sjoin(akiya_pred_gdf, city_block_gdf, how="inner", op="intersects")
        # 交差部分を計算
        spatial_join_gdf["intersection"] = spatial_join_gdf.apply(lambda row: row["geometry"].intersection(city_block_gdf.loc[row["index_right"], "geometry"]), axis=1)
        # 交差部分の面積を計算
        spatial_join_gdf["intersection_area"] = spatial_join_gdf["intersection"].area
        # 交差面積で降順にソート
        spatial_join_gdf = spatial_join_gdf.sort_values(by="intersection_area", ascending=False)
        # 重複を削除
        spatial_join_gdf = spatial_join_gdf.drop_duplicates(subset=cols["setai_code"], keep="first")
        # インデックスをリセット
        spatial_join_gdf.reset_index(inplace=True)
        
        return spatial_join_gdf
    
    def summarize_city_block(self, gdf):
        """
        小地域ごとに集計するメソッド
        
        Parameters
        ----------
        gdf : geopandas.GeoDataFrame
            空間結合後のGeoDataFrame
        
        Returns
        -------
        summerized_gdf : geopandas.GeoDataFrame
            小地域ごとに集計されたGeoDataFrame
        """
        akiya_pred_cols = self.INPUT_COLUMNS["akiya_pred"]
        city_block_cols = self.INPUT_COLUMNS["city_block"]
        
        summerized_gdf = gdf.groupby(city_block_cols["KEY_CODE"]).agg(
            # 建物戸数を集計
            建物戸数=(akiya_pred_cols["setai_code"], "count"),
            # 空き家数を集計
            空き家数=(akiya_pred_cols["pred"], "sum")
        )
        summerized_gdf.reset_index(inplace=True)
        # 空き家率を計算
        summerized_gdf["空き家率"] = summerized_gdf["空き家数"] / summerized_gdf["建物戸数"]
        
        return summerized_gdf
    
    def process(self):
        """
        メインの処理を行うメソッド
        
        Parameters
        ----------
        None
        
        Returns
        -------
        None
        """
        # データを読み込む
        akiya_pred_df = self.read_file(self.INPUT_PATHS["akiya_pred"], encoding="shift_jis")
        city_block_gdf = self.read_file(self.INPUT_PATHS["city_block"]["shp"])
        
        # GeoDataFrameに変換
        akiya_pred_cols = self.INPUT_COLUMNS["akiya_pred"]
        # null値を除外
        akiya_pred_df = akiya_pred_df[akiya_pred_df[akiya_pred_cols["akiya_geometry"]].notnull()]
        # WKT形式の文字列をジオメトリに変換
        akiya_pred_df[akiya_pred_cols["akiya_geometry"]] = akiya_pred_df[akiya_pred_cols["akiya_geometry"]].apply(load_wkt)
        # Z座標を削除
        akiya_pred_df[akiya_pred_cols["akiya_geometry"]] = akiya_pred_df[akiya_pred_cols["akiya_geometry"]].apply(self.remove_z_coordinate)
        # GeoDataFrameに変換
        akiya_pred_gdf = gpd.GeoDataFrame(akiya_pred_df, geometry=akiya_pred_cols["akiya_geometry"], crs="EPSG:4326")
        
        # 座標系変換
        city_block_gdf = city_block_gdf.to_crs("EPSG:4326")
        
        # 空間結合
        spatial_join_gdf = self.spatial_join(akiya_pred_gdf, city_block_gdf)
        
        # 小地域に集計
        summerized_gdf = self.summarize_city_block(spatial_join_gdf)
        
        # 小地域ポリゴンに集計結果を結合
        summerized_gdf = pd.merge(city_block_gdf, summerized_gdf, how="left", on="KEY_CODE")
        
        # DataFrameに変換
        summerized_df = pd.DataFrame(summerized_gdf)
    
        # 必要なカラムのみ選択
        summerized_df = summerized_df[self.OUTPUT_COLUMNS]
        
        # 出力
        self.save_csv(summerized_df, self.OUTPUT_PATH, encoding="shift_jis")
        
def move_uploaded_file(file, save_dir):
    """
    アップロードされたファイルを移動するヘルパー関数
    
    Parameters
    ----------
    file : gradio.File
        アップロードされたファイルオブジェクト
    save_dir : str
        ファイルを保存するディレクトリのパス
    
    Returns
    -------
    file_path : str
        移動後のファイルパス
    """
    # 保存先のディレクトリを作成
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    # ファイルを一時ディレクトリに移動
    file_name = os.path.basename(file.name)
    file_path = os.path.join(save_dir, file_name)
    shutil.move(file.name, file_path)
    
    return file_path

def process_summarization(akiya_pred_file, shp_file, dbf_file, prj_file, shx_file):
    """
    Gradioインターフェースから呼び出される関数
    
    Parameters
    ----------
    akiya_pred_file : gradio.File
        空き家予測結果のファイル
    shp_file : gradio.File
        小地域データのshpファイル
    dbf_file : gradio.File
        小地域データのdbfファイル
    prj_file : gradio.File
        小地域データのprjファイル
    shx_file : gradio.File
        小地域データのshxファイル
    
    Returns
    -------
    output_path : str
        生成された集計結果ファイルのパス
    """
    # 現在のディレクトリ直下に一時ディレクトリを作成
    temp_dir = os.path.join(os.getcwd(), "temp_files")
    os.makedirs(temp_dir, exist_ok=True)

    # ファイルを一時ディレクトリに移動
    akiya_pred_path = move_uploaded_file(akiya_pred_file, temp_dir)
    shp_path = move_uploaded_file(shp_file, temp_dir)
    dbf_path = move_uploaded_file(dbf_file, temp_dir)
    prj_path = move_uploaded_file(prj_file, temp_dir)
    shx_path = move_uploaded_file(shx_file, temp_dir)
    
    input_paths = {
        "akiya_pred": akiya_pred_path,
        "city_block": {
            "shp": shp_path,
            "dbf": dbf_path,
            "prj": prj_path,
            "shx": shx_path
        }
    }
    
    # 出力ファイルのパスを設定
    output_path = os.path.join(temp_dir, "D903.csv")
    
    # 集計処理を実行
    Summarization(input_paths, output_path).process()
    
    return output_path

if __name__ == "__main__":
    # gradioインターフェースの作成
    iface = gr.Interface(
        fn=process_summarization,
        inputs=[
            gr.File(label="【D902】空き家判定結果データ"),
            gr.File(label="【D013】国勢調査小地域データ（町丁・字等) - .shp"),
            gr.File(label="【D013】国勢調査小地域データ（町丁・字等) - .dbf"),
            gr.File(label="【D013】国勢調査小地域データ（町丁・字等) - .prj"),
            gr.File(label="【D013】国勢調査小地域データ（町丁・字等) - .shx")
        ],
        outputs=gr.File(label="【D903】地域別集計データ"),
        title="E032 - 地域集計機能",
        description="建物単位の空き家判定結果を指定の地域区分（小地域単位など）で再集計した結果を出力する機能"
    )
    
    iface.launch() 