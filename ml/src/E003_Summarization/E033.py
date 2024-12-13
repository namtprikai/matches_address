import argparse
import logging
import os
import sys
import geopandas as gpd
from shapely import wkt
from shapely.geometry import MultiPolygon, Polygon
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
async_tasks_path = os.path.join(current_dir, '..', 'async_tasks')
if async_tasks_path not in sys.path:
    sys.path.append(async_tasks_path)

try:
    from utils import *
except ImportError:
    sys.path.remove(async_tasks_path)
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
    from async_tasks.utils import *


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

def read_input_data(data_set_results_id, reference_date, table_name):
    try:
        df = get_data_set_detail_buildings_or_area(data_set_results_id, reference_date, table_name)
        
        if df is None:
            raise Exception("No data found")
        if 'geometry' not in df.columns:
            raise ValueError("'geometry' column is missing in the input data")

        df['geometry'] = df['geometry'].apply(wkt.loads)
        df['geometry'] = df['geometry'].apply(remove_z_coordinate)

        gdf = gpd.GeoDataFrame(df, geometry='geometry')

        if gdf.crs is None:
            gdf.set_crs(epsg=4326, inplace=True)

        return gdf
    except Exception as e:
        logging.error(f"An error occurred while reading input data: {str(e)}")
        raise




def export_data(gdf, output_path, output_format):
    """
    データをエクスポートする関数
    """
    try:
        if output_format.lower() == 'csv':
            encodings = ['utf-8-sig']
            for encoding in encodings:
                try:
                    gdf.to_csv(output_path, index=False, encoding=encoding)
                    logging.info(f"CSV exported successfully using {encoding} encoding.")
                    return output_path
                except Exception as e:
                    logging.warning(f"Failed to export CSV with {encoding} encoding: {e}")
            raise ValueError("Failed to export CSV with all attempted encodings.")
        elif output_format.lower() == 'geojson':
            gdf.to_file(output_path, driver='GeoJSON')
            logging.info("GeoJSON exported successfully.")
        elif output_format.lower() == 'geopackage':
            gdf['fid'] = range(1, len(gdf) + 1)
            gdf.to_file(output_path, driver='GPKG')
            logging.info("GPKG exported successfully.")
        else:
            raise ValueError("Unsupported output format. Use 'csv' or 'geopackage' or 'geojson'.")
        return output_path
    except ValueError as e:
        raise
    except Exception as e:
        logging.error(f"An error occurred during export: {str(e)}")
        raise

def processing(params, job_id=None, db_path=None):
    """
    メイン処理を行う関数
    """
    try:
        if db_path:
            connect_sqllite(db_path)
        data_set_results_id = params['data_set_results_id']
        table_name = "data_set_detail_buildings"
        target_unit = params['target_unit']
        if (target_unit == 'area'):
            table_name = 'data_set_detail_areas'
            
        output_path = params['output_path']
        task_id = None
        if job_id:
            task_id = create_or_update_job_task(job_id, progress_percent="0", preprocess_type=None, error_code=None, result=json.dumps({}))

        gdf = read_input_data(data_set_results_id, params.get("reference_date"), table_name)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="20", preprocess_type=None, error_code=None, result=json.dumps({}), id= task_id)
        if params.get('target_crs'):
            logging.info(f"Target CRS specified: {params['target_crs']}")
            target_crs = params['target_crs']
            if gdf.crs.to_string().upper() != target_crs.upper():
                logging.info(f"Converting CRS from {gdf.crs} to {target_crs}")
                target_crs = target_crs.split(':')
                if len(target_crs) > 1:
                    target_crs = target_crs[1].split(' ')[0]
                else:
                    target_crs = target_crs[0]
                target_crs_epsg = int(target_crs)
                gdf = gdf.to_crs(epsg=target_crs_epsg)
                logging.info(f"CRS conversion completed. New CRS: {gdf.crs}")
            else:
                logging.info("Input CRS matches target CRS. No conversion needed.")
        else:
            logging.info("No target CRS specified. Skipping conversion.")

        if job_id:
            create_or_update_job_task(job_id, progress_percent="40", preprocess_type=None, error_code=None, result=json.dumps({}), id= task_id)
        
        logging.info(f"Exporting data to {output_path}")
        output_file_path = export_data(gdf, output_path, params['output_format'])

        if job_id:
            create_or_update_job_task(job_id, progress_percent="100", preprocess_type=None, error_code=None, result=json.dumps({}), id= task_id, is_finish=True)

        logging.info("Processing completed successfully")
        return output_file_path
    except Exception as e:
        if task_id is not None:
            create_or_update_job_task(job_id, progress_percent="", preprocess_type=None, error_code="e001", result=json.dumps({}), id= task_id, is_finish=True)

        logging.error(f"An error occurred: {str(e)}")
        raise Exception("Error: CRS conversion process encountered an issue")



def main():
    parser = argparse.ArgumentParser(description="E033 - データ出力機能")
    parser.add_argument("input_file", help="入力ファイルのパス (D902・D903)")
    parser.add_argument("output_format", choices=['csv', 'geojson'], help="出力データ形式")
    parser.add_argument("--target_crs", choices=COMMON_CRS + ['custom'], help="変換後の座標系")
    parser.add_argument("--custom_crs", help="カスタム座標系 (例: EPSG:2249)")
    parser.add_argument("--output_path", help="出力ファイルのパス")
    parser.add_argument("--job_id", default=None)
    parser.add_argument("--db_path", default=None)
    
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

    result = processing(params, args.job_id, args.db_path)
    print(result)

if __name__ == '__main__':
    main()
