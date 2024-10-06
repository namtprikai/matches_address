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
from shapely.geometry import MultiPolygon, Polygon
from shapely.wkt import loads as load_wkt
from datetime import datetime
import argparse

class Summarization:
    def __init__(self, input_paths, output_path, key_column):
        # 入力ファイルのパスを設定
        self.INPUT_PATHS = input_paths
        # 出力ファイルのパスを設定
        self.OUTPUT_PATH = output_path
        # 集計に使用するカラム名を設定
        self.key_column = key_column

        # 各データで使用するカラムを定義
        self.INPUT_COLUMNS = {
            "akiya_pred": {
                "setai_code": "世帯コード",
                "pred": "pred",
                "akiya_geometry": "geometry",
                "世帯人数": "世帯人数",  # '世帯人数' カラムを追加
                "15歳未満構成比": "15歳未満構成比",
                "65歳以上人数": "65歳以上人数"
            },
            "city_block": {
                "KEY_CODE": self.key_column,
                "city_block_geometry": "geometry"
            }
        }

        # 出力するデータのカラムを定義
        self.OUTPUT_COLUMNS = [
            self.key_column,
            "住戸数",
            "空き家数",
            "空き家率",
            "若年層率",
            "高齢者率",
            "geometry"
        ]


    
    def summarize_city_block(self, gdf):
        """
        市区町村ブロックごとの集計を行う関数。

        Parameters:
        -----------
        gdf : GeoDataFrame
            空間結合されたGeoDataFrame。各建物情報と地域の情報を含む。

        Returns:
        --------
        GeoDataFrame
            地域ごとの住戸数、空き家数、空き家率、若年層率、高齢者率を集計したGeoDataFrame。
        """
        akiya_pred_cols = self.INPUT_COLUMNS["akiya_pred"]

        # 各市区町村ブロックごとに集計を行う
        summerized_gdf = gdf.groupby(self.key_column).agg(
            住戸数=(akiya_pred_cols["setai_code"], "count"),
            空き家数=(akiya_pred_cols["pred"], "sum"),
            人口=(akiya_pred_cols["世帯人数"], "sum"),  
            若年人口=(akiya_pred_cols["15歳未満構成比"], "sum"), 
            高齢者人口=(akiya_pred_cols["65歳以上人数"], "sum")  
        )
        summerized_gdf.reset_index(inplace=True)

        # 空き家率を計算
        summerized_gdf["空き家率"] = summerized_gdf["空き家数"] / summerized_gdf["住戸数"]

        # 若年層率を計算
        summerized_gdf["若年層率"] = summerized_gdf["若年人口"] / summerized_gdf["人口"]

        # 高齢者率を計算
        summerized_gdf["高齢者率"] = summerized_gdf["高齢者人口"] / summerized_gdf["人口"]

        return summerized_gdf
    
    
    
    def remove_z_coordinate(self, geometry):
        """
        ジオメトリからZ座標（高さ情報）を除去する関数。
    
        Parameters:
        -----------
        geometry : shapely.geometry
            Z座標を含む可能性のあるPolygonまたはMultiPolygonジオメトリ。
    
        Returns:
        --------
        shapely.geometry
            Z座標を除去したジオメトリ。
        """
        if geometry.geom_type == 'Polygon':
            return Polygon([(x, y) for x, y, z in geometry.exterior.coords])
        elif geometry.geom_type == 'MultiPolygon':
            new_polygons = []
            for poly in geometry.geoms:
                new_polygons.append(Polygon([(x, y) for x, y, z in poly.exterior.coords]))
            return MultiPolygon(new_polygons)
        else:
            return geometry
    
    

    def spatial_join(self, residence_gdf, city_block_gdf):
        """
        空き家判定データと市区町村ブロックデータを空間結合する関数。
        空間インデックスを利用し、residence_gdfのジオメトリの重心（centroid）で空間結合を行います。
        """

        residence_gdf = residence_gdf[["世帯コード","正規化住所","世帯人数","15歳未満人数","15歳未満構成比","15歳以上64歳以下人数","15歳以上64歳以下構成比","65歳以上人数","65歳以上構成比","最大年齢","最小年齢","男女比","住定期間","geometry","pred"]]
        
        # 重心（centroid）を計算する前に、投影座標系（EPSG:4326）に変換
        residence_gdf_projected = residence_gdf.to_crs(epsg=4326)

        # 重心（centroid）を計算し、新しい 'centroid_geometry' 列に格納
        residence_gdf_projected['centroid_geometry'] = residence_gdf_projected.centroid.to_crs(epsg=4326)

        # 重心の計算後、元の座標系（EPSG:4326）に戻す
        residence_gdf = residence_gdf_projected.to_crs(epsg=4326)

        # 空間インデックスを利用した結合
        if not residence_gdf.has_sindex:
            residence_gdf.sindex  # 空間インデックスを作成
        if not city_block_gdf.has_sindex:
            city_block_gdf.sindex  # 空間インデックスを作成

        print(residence_gdf.head(5), city_block_gdf.head(5))
        # 空間結合を実施（centroid_geometry列を使用）
        spatial_join_gdf = gpd.sjoin(residence_gdf.set_geometry('centroid_geometry'), 
                                    city_block_gdf, how="inner", predicate="intersects", 
                                    lsuffix='left', rsuffix='right')

        # 各行のジオメトリ同士の交差部分を計算
        #spatial_join_gdf["intersection"] = spatial_join_gdf.geometry.intersection(city_block_gdf.unary_union)

        # 交差した部分の面積を計算
        #spatial_join_gdf["intersection_area"] = spatial_join_gdf["intersection"].area

        # 面積が大きい順にソートし、重複を削除
        #spatial_join_gdf = spatial_join_gdf.sort_values(by="intersection_area", ascending=False)
        #spatial_join_gdf = spatial_join_gdf.drop_duplicates(subset=self.INPUT_COLUMNS["akiya_pred"]["setai_code"], keep="first")
        #spatial_join_gdf.reset_index(inplace=True)

        # centroidではなく元のgeometry列を使用するため、元に戻す
        spatial_join_gdf = spatial_join_gdf.set_geometry('geometry')

        return spatial_join_gdf

    
    
    def insert_sqlite(self, summerized_df):
        """
        集計結果をSQLiteデータベースに挿入する関数。
    
        Parameters:
        -----------
        summerized_df : DataFrame
            SQLiteデータベースに挿入するための集計済みデータ。
    
        Returns:
        --------
        None
        """
        global conn
        try:
            # カラム名の日本語を英語に変換
            mapping_header = {
                '住戸数': 'total_building_count',
                '空き家数': 'vacant_house_count',
                '空き家率': 'vacant_house_ratio',
                "若年層率": 'under15_population_ratio',
                "高齢者率": 'upper65_population_ratio'
            }
            summerized_df['geometry'] = summerized_df['geometry'].apply(lambda x: x.wkt if x else None)
            summerized_df = summerized_df.rename(columns=mapping_header)
            current_year = datetime.now().year
            table_name = f"D903_akiyaresult_{current_year}"
            
            # SQLiteに接続し、データを挿入
            conn = sqlite3.connect('akiya_database.db')
            summerized_df.to_sql(table_name, conn, if_exists='replace', index=False)
            print(f"Inserted data into table {table_name}")
        except Exception as e:
            print(f"Error when insert SQLite: {e}")
        finally:
            if conn:
                conn.close()


            if conn:
                conn.close()

    def process(self):
        # データを読み込む
        residence_gdf = gpd.read_file(self.INPUT_PATHS["akiya_pred"])

        # city_block のファイル形式に応じて読み込み
        if "shp" in self.INPUT_PATHS["city_block"]:
            print("Reading shapefile...")
            city_block_gdf = gpd.read_file(self.INPUT_PATHS["city_block"])
        elif "gpkg" in self.INPUT_PATHS["city_block"]:
            print("Reading GeoPackage...")
            city_block_gdf = gpd.read_file(self.INPUT_PATHS["city_block"])
        elif "geojson" in self.INPUT_PATHS["city_block"]:
            print("Reading GeoJSON...")
            city_block_gdf = gpd.read_file(self.INPUT_PATHS["city_block"])
        elif "csv" in self.INPUT_PATHS["city_block"]:
            print("Reading CSV with WKT...")
            city_block_df = pd.read_csv(self.INPUT_PATHS["city_block"])

            if "geometry" in city_block_df.columns:
                city_block_df["geometry"] = city_block_df["geometry"].apply(load_wkt)  # WKT形式からジオメトリを生成
                city_block_gdf = gpd.GeoDataFrame(city_block_df, geometry="geometry", crs="EPSG:4326")
            else:
                raise ValueError("CSV does not contain a 'geometry' column with WKT data.")
        else:
            raise ValueError("No valid spatial file format found")

        if city_block_gdf is None:
            raise ValueError("city_block_gdf is None. File may not have been read correctly.")
        
        # 座標系変換
        residence_gdf = residence_gdf.to_crs("EPSG:4326")
        print(f"Converting CRS to EPSG:4326 for {type(city_block_gdf)}")
        city_block_gdf = city_block_gdf.to_crs("EPSG:4326")
 
        # 空間結合
        spatial_join_gdf = self.spatial_join(residence_gdf, city_block_gdf)
        print(spatial_join_gdf.head(5), spatial_join_gdf.columns.values)

        # 小地域に集計
        summerized_gdf = self.summarize_city_block(spatial_join_gdf)
        print(summerized_gdf.head(5),summerized_gdf.columns.values)

        # 小地域ポリゴンに集計結果を結合
        summerized_gdf = pd.merge(city_block_gdf, summerized_gdf, how="left", right_on=self.key_column, left_on=self.key_column)

        summerized_gdf = summerized_gdf[self.OUTPUT_COLUMNS]

        # 出力
        #summerized_gdf.to_file(self.OUTPUT_PATH)
        summerized_gdf.to_csv(self.OUTPUT_PATH, encoding="Shift-JIS", index=False)

        # insert sqlite
        # 今は一時的に停止
        #self.insert_sqlite(summerized_df)




def move_uploaded_file(file, save_dir):
    # 保存先のディレクトリを作成
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # ファイルを一時ディレクトリに移動
    file_name = os.path.basename(file.name)
    file_path = os.path.join(save_dir, file_name)
    shutil.move(file.name, file_path)

    return file_path


def process_summarization(akiya_pred_file, spatial_file, key_column):
    # 一時ディレクトリを作成
    temp_dir = os.path.join(os.getcwd(), "temp_files")
    os.makedirs(temp_dir, exist_ok=True)

    # 空き家判定ファイルを移動
    akiya_pred_path = move_uploaded_file(akiya_pred_file, temp_dir)

    # ファイル拡張子を取得
    file_ext = os.path.splitext(spatial_file.name)[1].lower()

    if file_ext == ".zip":
        # zipファイルを解凍
        extracted_files = extract_zip(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": extracted_files  # 解凍されたファイルを渡す
        }

    elif file_ext == ".gpkg":
        # GeoPackageファイルをそのまま使用
        gpkg_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "gpkg": gpkg_path
            }
        }

    elif file_ext == ".geojson":
        # GeoJSONファイルをそのまま使用
        geojson_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "geojson": geojson_path
            }
        }

    elif file_ext == ".csv":
        # CSVファイルをそのまま使用（WKTフォーマット）
        csv_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "csv": csv_path
            }
        }

    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

    # 出力ファイルのパスを設定
    output_path = os.path.join(temp_dir, "D903.csv")

    Summarization(input_paths, output_path, key_column).process()

    return output_path



def extract_zip(zip_file, extract_to):
    """
    .zip ファイルを解凍し、Shapefile (.shp, .shx, .dbf, .prj) を抽出する。
    """
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    files = os.listdir(extract_to)
    shp_file = [os.path.join(extract_to, f) for f in files if f.endswith(".shp")][0]
    return shp_file



def process_summarization(akiya_pred_file, spatial_file, output_dir, key_column):
    # 一時ディレクトリを作成
    temp_dir = os.path.join(os.getcwd(), "temp_files")
    os.makedirs(temp_dir, exist_ok=True)

    # 空き家判定ファイルを移動
    akiya_pred_path = move_uploaded_file(akiya_pred_file, temp_dir)

    # ファイル拡張子を取得
    file_ext = os.path.splitext(spatial_file)[1].lower()

    if file_ext == ".zip":
        # zipファイルを解凍
        extracted_files = extract_zip(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": extracted_files  # 解凍されたファイルを渡す
        }

    elif file_ext == ".gpkg":
        # GeoPackageファイルをそのまま使用
        gpkg_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "gpkg": gpkg_path
            }
        }

    elif file_ext == ".geojson":
        # GeoJSONファイルをそのまま使用
        geojson_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "geojson": geojson_path
            }
        }

    elif file_ext == ".csv":
        # CSVファイルをそのまま使用（WKTフォーマット）
        csv_path = move_uploaded_file(spatial_file, temp_dir)
        input_paths = {
            "akiya_pred": akiya_pred_path,
            "city_block": {
                "csv": csv_path
            }
        }

    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

    # 出力ファイルのパスを設定
    output_path = os.path.join(temp_dir, "D903.csv")

    # 集計に使用するカラム名も引数として渡す
    Summarization(input_paths, output_path, key_column).process()

    return output_path



def main():
    parser = argparse.ArgumentParser(description="E032 - 地域集計機能")
    
    # 空き家判定ファイルのパスを指定
    parser.add_argument("akiya_pred_file", help="【D902】空き家判定結果データのファイルパス")
    
    # 小地域データとして、gpkg か zip のどちらかを指定
    parser.add_argument(
        "spatial_file", 
        help="【D013】国勢調査小地域データ（町丁・字等) - .gpkgまたは.zipファイルのパス"
    )

    # 集計に使用するカラム名の指定
    parser.add_argument(
        "--key_column", 
        default="KEY_CODE", 
        help="集計に使用するカラム名（デフォルト: KEY_CODE）"
    )

    # 出力ディレクトリのオプション
    parser.add_argument(
        "--output_dir", 
        default=".", 
        help="出力ディレクトリ（デフォルト: カレントディレクトリ）"
    )
    
    args = parser.parse_args()

    # 入力ファイルの拡張子を確認
    spatial_file_ext = os.path.splitext(args.spatial_file)[1].lower()

    if spatial_file_ext not in [".zip", ".gpkg"]:
        raise ValueError("読み込めるファイル形式は .zip または .gpkg のみです。")

    # process_summarization関数を呼び出して処理を実行
    output_path = process_summarization(
        args.akiya_pred_file,
        args.spatial_file,
        args.output_dir,
        args.key_column
    )

    print(f"地域別集計データが保存されました: {output_path}")


if __name__ == "__main__":
    main()
