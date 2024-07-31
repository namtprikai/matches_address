"""
# E033 データ出力機能 
* E002による判定結果及び集計結果をGISデータ形式（GeoJSON等の標準形式）及びテキスト形式（CSV等）で出力する機能。アセットのエクスポート機能を提供する。なお、エクスポート時に出力座標系を選択できるようにする。 
"""

import argparse
import json
import logging
import os

import chardet
import geopandas as gpd
import pandas as pd
from osgeo import gdal
from shapely import wkt
from shapely.geometry import MultiPolygon, Polygon

# ログ設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# GDALエラーハンドリングの設定
gdal.UseExceptions()

def remove_z_coordinate(geometry):
    """
    ジオメトリからZ座標（高さ）を削除する関数

    Parameters
    ----------
    geometry : shapely.geometry
        Z座標を含む可能性のある入力ジオメトリ

    Returns
    -------
    shapely.geometry
        Z座標が削除されたジオメトリ
    """
    # ポリゴンの場合
    if geometry.geom_type == 'Polygon':
        # 外部リングの座標からZ座標を除去し、新しいポリゴンを作成
        return Polygon([(x, y) for x, y, *_ in geometry.exterior.coords])
    # マルチポリゴンの場合
    elif geometry.geom_type == 'MultiPolygon':
        new_polygons = []
        # 各ポリゴンに対してZ座標を除去
        for poly in geometry.geoms:
            new_polygons.append(Polygon([(x, y) for x, y, *_ in poly.exterior.coords]))
        # 新しいマルチポリゴンを作成
        return MultiPolygon(new_polygons)
    # その他のジオメトリタイプの場合は変更せずに返す
    else:
        return geometry

def read_input_data(input_path):
    """
    入力データ（D902）を読み込む関数

    Parameters
    ----------
    input_path : str
        入力ファイルのパス

    Returns
    -------
    gdf : GeoDataFrame
        読み込んだデータ
    """
    # ファイルのエンコーディングを自動検出
    with open(input_path, 'rb') as file:
        raw_data = file.read()
    detected_encoding = chardet.detect(raw_data)['encoding']
    
    # エンコーディングのフォールバック順序
    encodings = [detected_encoding, 'utf-8', 'shift-jis', 'cp932']
    
    for encoding in encodings:
        try:
            # CSVファイルを読み込む
            df = pd.read_csv(input_path, encoding=encoding)
            logging.info(f"Successfully read the file using {encoding} encoding")
            break
        except UnicodeDecodeError:
            logging.warning(f"Failed to read with {encoding} encoding, trying next...")
    else:
        raise ValueError("Unable to read the file with any of the attempted encodings")

    # GeoDataFrameに変換
    if 'geometry' not in df.columns:
        raise ValueError("'geometry' column is missing in the input data")

    # WKTからジオメトリオブジェクトに変換
    df['geometry'] = df['geometry'].apply(wkt.loads)
    
    # Z座標が存在する場合、それを除去
    df['geometry'] = df['geometry'].apply(remove_z_coordinate)

    gdf = gpd.GeoDataFrame(df, geometry='geometry')

     # CRSが設定されていない場合、デフォルト値としてEPSG:4326を設定
    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)

    return gdf

def convert_crs(gdf, target_crs):
    """
    座標系を変換する関数（GDALを使用）

    Parameters
    ----------
    gdf : GeoDataFrame
        変換対象のデータ
    target_crs : str
        変換先の座標系（EPSG:xxxx形式）

    Returns
    -------
    gdf : GeoDataFrame
        変換後のデータ
    """
    try:
        # ログに変換前後の座標系を記録
        logging.info(f"Converting CRS from {gdf.crs} to {target_crs}")

        # target_crsがEPSG:xxxx形式であることを確認し、EPSGコードを抽出
        if target_crs.upper().startswith("EPSG:"):
            target_crs_epsg = int(target_crs.split(':')[1])
        else:
            # 不正な形式の場合、エラーを発生させる
            raise ValueError("target_crs must be in 'EPSG:xxxx' format")

        # GeoDataFrameの座標系を目標の座標系に変換
        gdf = gdf.to_crs(epsg=target_crs_epsg)

        logging.info(f"CRS conversion completed. New CRS: {gdf.crs}")
        # 変換後のGeoDataFrameを返す
        return gdf
    
    except Exception as e:
        # エラーが発生した場合、ログにエラー内容を記録し、例外を再発生させる
        logging.error(f"Error converting CRS: {str(e)}", exc_info=True)
        raise

def export_data(gdf, output_path, output_format):
    """
    データをエクスポートする関数

    Parameters
    ----------
    gdf : GeoDataFrame
        エクスポートするデータ
    output_format : str
        出力フォーマット ('csv' または 'geojson')
    output_path : str
        出力ファイルのパス

    Returns
    -------
    None
    """
    if output_format.lower() == 'csv':
        # エンコーディングの優先順位リスト
        encodings = ['shift_jis', 'cp932', 'utf-8']
        for encoding in encodings:
            try:
                # CSVファイルをエクスポート
                gdf.to_csv(output_path, index=False, encoding=encoding)
                logging.info(f"CSV exported using {encoding} encoding.")
                return output_path
            except UnicodeEncodeError:
                # エンコーディングが失敗した場合、次のエンコーディングを試す
                print(f"Failed to encode using {encoding}. Trying next encoding.")
        
        # すべてのエンコーディングが失敗した場合、エラーを発生させる
        raise ValueError("Failed to export using all encodings.")
        
    elif output_format == 'GeoJSON':
        # GeoJSONとしてエクスポート（UTF-8で出力後、Shift-JISに変換）
        temp_path = output_path + '.temp'
        gdf.to_file(temp_path, driver='GeoJSON')
        
        # UTF-8のGeoJSONを読み込み、Shift-JISに変換して保存
        with open(temp_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
        
        with open(output_path, 'w', encoding='shift-jis', errors='ignore') as f:
            json.dump(geojson_data, f, ensure_ascii=False, indent=2)
        
        # 一時ファイルを削除
        os.remove(temp_path)
        return output_path
    else:
        raise ValueError("Unsupported output format. Use 'csv' or 'geojson'.")

def main(input_file, output_format, target_crs):
    """
    メイン処理を行う関数

    Parameters
    ----------
    input_file : str
        入力ファイルのパス
    output_format : str
        出力形式（'csv' または 'geojson'）
    target_crs : str
        変換後の座標系（EPSG:xxxx形式）

    Returns
    -------
    str
        出力ファイルのパス
    """
    try:
        logging.info("Starting main processing")
        
        # 出力ファイルのパスを生成
        output_dir = os.path.dirname(input_file)
        output_filename = f"output.{output_format.lower()}"
        output_path = os.path.join(output_dir, output_filename)

        logging.info(f"Reading input data from {input_file}")
        # データの読み込み
        gdf = read_input_data(input_file)
        
        if target_crs:
            logging.info(f"Target CRS specified: {target_crs}")
            if gdf.crs.to_string().upper() != target_crs.upper():
                logging.info(f"Converting CRS from {gdf.crs} to {target_crs}")
                # 入力データの座標系と目標の座標系が異なる場合、変換を実行
                gdf = convert_crs(gdf, target_crs)
            else:
                logging.info("Input CRS matches target CRS. No conversion needed.")
        else:
            logging.info("No target CRS specified. Skipping conversion.")
        
        logging.info(f"Exporting data to {output_path}")
        # データのエクスポート
        output_file_path = export_data(gdf, output_path, output_format)

        logging.info("Processing completed successfully")
        return output_file_path
    except Exception as e:
        # エラーが発生した場合のログ記録と返値
        logging.error(f"An error occurred: {str(e)}")
        raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="E033 - データ出力機能")
    parser.add_argument('input_file', help='入力ファイルのパス')
    parser.add_argument('output_format', choices=['csv', 'geojson'], help='出力データ形式')
    parser.add_argument('--target_crs', help='変換後の座標系 (例: EPSG:4326)')
    
    args = parser.parse_args()
    
    try:
        result = main(args.input_file, args.output_format, args.target_crs)
        print(f"処理が完了しました。出力ファイル: {result}")
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")