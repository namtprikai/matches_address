import json
import logging
import os
import chardet
import geopandas as gpd
import gradio as gr
import pandas as pd
from shapely import wkt
from shapely.geometry import MultiPolygon, Polygon


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
]

# ログ設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def remove_z_coordinate(geometry):
    """
    ジオメトリからZ座標（高さ）を削除する関数
    """
    if geometry.geom_type == 'Polygon':
        return Polygon([(x, y) for x, y, *_ in geometry.exterior.coords])
    elif geometry.geom_type == 'MultiPolygon':
        new_polygons = [Polygon([(x, y) for x, y, *_ in poly.exterior.coords]) for poly in geometry.geoms]
        return MultiPolygon(new_polygons)
    else:
        return geometry

def read_input_data(input_path):
    """
    入力データ（D902）を読み込む関数
    """
    with open(input_path, 'rb') as file:
        raw_data = file.read()
    detected_encoding = chardet.detect(raw_data)['encoding']
    
    encodings = [detected_encoding, 'shift-jis', 'cp932', 'utf-8']
    
    for encoding in encodings:
        try:
            df = pd.read_csv(input_path, encoding=encoding)
            logging.info(f"Successfully read the file using {encoding} encoding")
            break
        except UnicodeDecodeError:
            logging.warning(f"Failed to read with {encoding} encoding, trying next...")
    else:
        raise ValueError("Unable to read the file with any of the attempted encodings")

    if 'geometry' not in df.columns:
        raise ValueError("'geometry' column is missing in the input data")

    df['geometry'] = df['geometry'].apply(wkt.loads)
    df['geometry'] = df['geometry'].apply(remove_z_coordinate)

    gdf = gpd.GeoDataFrame(df, geometry='geometry')

    if gdf.crs is None:
        gdf.set_crs(epsg=4326, inplace=True)

    return gdf



def export_data(gdf, output_path, output_format):
    """
    データをエクスポートする関数
    """
    if output_format.lower() == 'csv':
        encodings = ['shift_jis', 'cp932', 'utf-8']
        for encoding in encodings:
            gdf.to_csv(output_path, index=False, encoding=encoding)
            print(f"CSV exported using {encoding} encoding.")
 
    elif output_format.lower() == 'geojson':
        gdf.to_file(output_path, driver='GeoJSON')
    else:
        raise ValueError("Unsupported output format. Use 'csv' or 'geojson'.")

    return output_path

def processing(params):
    """
    メイン処理を行う関数
    """
    try:
        input_path = params['input_file']
        output_path = params['output_path']

        logging.info(f"Reading input data from {input_path}")
        gdf = read_input_data(input_path)
        
        if params.get('target_crs'):
            logging.info(f"Target CRS specified: {params['target_crs']}")
            target_crs = params['target_crs']
            if gdf.crs.to_string().upper() != target_crs.upper():
                logging.info(f"Converting CRS from {gdf.crs} to {target_crs}")
                if target_crs.upper().startswith("EPSG:"):
                    target_crs_epsg = int(target_crs.split(':')[1])
                else:
                    raise ValueError("target_crs must be in 'EPSG:xxxx' format")

                gdf = gdf.to_crs(epsg=target_crs_epsg)

                logging.info(f"CRS conversion completed. New CRS: {gdf.crs}")
            else:
                logging.info("Input CRS matches target CRS. No conversion needed.")
        else:
            logging.info("No target CRS specified. Skipping conversion.")
        
        logging.info(f"Exporting data to {output_path}")
        output_file_path = export_data(gdf, output_path, params['output_format'])

        logging.info("Processing completed successfully")
        return output_file_path
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return f"An error occurred: {str(e)}"



def main():
    parser = argparse.ArgumentParser(description="E033 - データ出力機能")
    parser.add_argument("input_file", help="入力ファイルのパス (D902・D903)")
    parser.add_argument("output_format", choices=['csv', 'geojson'], help="出力データ形式")
    parser.add_argument("--target_crs", choices=COMMON_CRS + ['custom'], help="変換後の座標系")
    parser.add_argument("--custom_crs", help="カスタム座標系 (例: EPSG:2249)")
    parser.add_argument("--output_path", help="出力ファイルのパス")
    
    args = parser.parse_args()

    # Set target_crs based on input
    if args.target_crs == 'custom':
        if not args.custom_crs:
            parser.error("--custom_crs is required when --target_crs is 'custom'")
        target_crs = args.custom_crs
    else:
        target_crs = args.target_crs

    # Set default output path if not provided
    if not args.output_path:
        output_dir = os.path.dirname(args.input_file)
        output_filename = f"D903.{args.output_format.lower()}"
        args.output_path = os.path.join(output_dir, output_filename)

    params = {
        'input_file': args.input_file,
        'output_format': args.output_format,
        'target_crs': target_crs,
        'output_path': args.output_path
    }

    result = processing(params)
    print(result)

if __name__ == '__main__':
    main()
