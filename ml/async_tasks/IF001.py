
import argparse
import json
import os
import shutil
import sys
import uuid
from utils import *
from constants import *

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from src.E001_DataMatching.E012 import process_data as E012
from src.E001_DataMatching.E013 import process_all_data as E013
from src.E001_DataMatching.E014 import embedding_address as E014
from src.E001_DataMatching.E014 import filter_building_usage
from src.E001_DataMatching.E016 import extend_columns, process_census_data as FN007
from src.E001_DataMatching.E016 import merge_residential_addresses as FN006
from src.E001_DataMatching.E016 import process_spatial_join, merge_building_type_determination

sys.stdin = open(sys.stdin.fileno(), mode='r', encoding='utf-8')
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8')

def main():

    parser = argparse.ArgumentParser(description="E001 データ処理システム")
    parser.add_argument("--parameters", type=str)
    args = parser.parse_args()
 
    json_dict = json.loads(args.parameters)
    if isinstance(json_dict, str):
        json_dict = json.loads(json_dict)
    job_id = None
    try:
        database_path = json_dict.get('database_path', None)
        job_id = json_dict.get('job_id', None)
        if not database_path:
            raise Exception("Error: database_path field is required")

        connect_sqllite(database_path)
        job_id = create_or_update_job(job_id ,"", "preprocess", os.getpid(), 0, args.parameters, True)

        params = {
            'db_path': database_path,
            'output_path': json_dict.get('output_path', '.'),
            'suido_status': json_dict.get('data', {}).get('water_status', {}).get('path', None),
            'suido_status_columns': json_dict.get('data', {}).get('water_status', {}).get('columns', {}),
            'suido_use': json_dict.get('data', {}).get('water_usage', {}).get('path', None),
            'suido_use_columns': json_dict.get('data', {}).get('water_usage', {}).get('columns', {}),
            'juki': json_dict.get('data', {}).get('resident_registry', {}).get('path', None),
            'juki_columns': json_dict.get('data', {}).get('resident_registry', {}).get('columns', {}),
            'touki': json_dict.get('data', {}).get('land_registry', {}).get('path', None),
            'touki_columns': json_dict.get('data', {}).get('land_registry', {}).get('columns', {}),
            'akiya_result': json_dict.get('data', {}).get('vacant_house', {}).get('path', None),
            'akiya_result_columns': json_dict.get('data', {}).get('vacant_house', {}).get('columns', {}),
            'reverse_geocoded_building_polygon': json_dict.get('data', {}).get('reverse_geocoded_building_polygon', {}).get('path', None),
            'reverse_geocoded_columns': json_dict.get('data', {}).get('reverse_geocoded_building_polygon', {}).get('columns', {}),
            'census': json_dict.get('data', {}).get('census', {}).get('path', None),
            'n_gram_size': json_dict.get('settings', {}).get('advanced', {}).get('n_gram_size', "2"),
            'similarity_threshold': json_dict.get('settings', {}).get('advanced', {}).get('similarity_threshold', "0.95"),
            'joining_method': json_dict.get('settings', {}).get('advanced', {}).get('joining_method', ""),
            'reference_date': json_dict.get('settings', {}).get('reference_date', ""),
            'residential_addresses': json_dict.get('data', {}).get('residential_addresses', {}).get('path', None),
            'residential_addresses_columns': json_dict.get('data', {}).get('residential_addresses', {}).get('columns', {}),
            'address_of_lot_number': json_dict.get('data', {}).get('address_of_lot_number', {}).get('path', None),
            'address_of_lot_number_columns': json_dict.get('data', {}).get('address_of_lot_number', {}).get('columns', {}),
            'address_of_lot_number_type_file': json_dict.get('data', {}).get('address_of_lot_number', {}).get('type_file', 'csv'),
            'building_type_determination': json_dict.get('data', {}).get('building_type_determination', {}).get('path', None),
            'building_type_determination_columns': json_dict.get('data', {}).get('building_type_determination', {}).get('columns', {}),
            'building_type_determination_values': json_dict.get('data', {}).get('building_type_determination', {}).get('residential_values', []),
            'building_type_determination_type_file': json_dict.get('data', {}).get('building_type_determination', {}).get('type_file', 'csv'),
        }

        columns = {
            "suido_status": {
                "suido_number": params.get("suido_status_columns", {}).get("water_supply_number"),
                "usage_status": params.get("suido_status_columns", {}).get("water_disconnection_flag"),
                "suido_status_address": params.get("suido_status_columns", {}).get("address"),
                "usage_start_date": params.get("suido_status_columns", {}).get("water_connection_date"),
                "usage_end_date": params.get("suido_status_columns", {}).get("water_disconnection_date"),
            },
            "suido_use": {
                "suido_number": params.get("suido_use_columns", {}).get("water_supply_number"),
                "meter_reading_date": params.get("suido_use_columns", {}).get("water_recorded_date"),
                "suido_usage": params.get("suido_use_columns", {}).get("water_usage"),
            },
            "juki": {
                "setai_code": params.get("juki_columns", {}).get("household_code"),
                "juki_address": params.get("juki_columns", {}).get("address"),
                "birth": params.get("juki_columns", {}).get("birth_date"),
                "gender": params.get("juki_columns", {}).get("gender"),
                "move_date": params.get("juki_columns", {}).get("resident_date"),
            },
            "touki": {
                "touki_address": params.get("touki_columns", {}).get("address"),
                "structure":  params.get("touki_columns", {}).get("structure_name"),
                "registration_date":  params.get("touki_columns", {}).get("registration_date"),
                "building_detail": params.get("touki_columns", {}).get("building_detail", "建物情報_登記内容")
            },
            "akiya_result": {
                "akiya_result_address": params.get("akiya_result_columns", {}).get("address", "住所")
            },
            "geocoding": {
                "geocoding_address": params.get("reverse_geocoded_columns", {}).get("address", "new_address"),
                "geometry": params.get("reverse_geocoded_columns", {}).get("geometry", "geometry"),
            }
        }
        create_or_update_job(job_id, "2")
        random_str = str(uuid.uuid4())
        output_directory = concatenate(params.get('output_path'), random_str)
        join_option = "交差結合"
        if params.get('joining_method') == 'nearest':
            join_option = '最近傍結合'
        search_period = "1"
        
        suido_use_file = None
        suido_status_file = None
        juki_file = None
        tatemono_file = None
        input_source = []
        input_source_jp = {
            'juki': '住基',
            'suido_status': '水道',
            'touki': '建物情報',
            'akiya_result': '空き家調査',
            'geocoding': 'リバースジオコーディング済建物ポリゴンデータ',
        }

        main_data_type = 'suido_status'
            
        if params.get('juki'):
            main_data_type = 'juki'

        input_files = {
            "akiya_result": concatenate(params.get('output_path'), params.get('akiya_result')),
            "geocoding": concatenate(params.get('output_path'), params.get('reverse_geocoded_building_polygon')),
        }

        if params.get('juki'):
            input_files['juki'] = concatenate(params.get('output_path'), params.get('juki'))
            juki_file = f"{output_directory}/juki_cleaned.csv"
            input_source.append('juki')
            
        if params.get('suido_status'):
            input_files['suido_status'] = concatenate(params.get('output_path'), params.get('suido_status'))
            suido_status_file = f"{output_directory}/suido_status_cleaned.csv"
            input_source.append('suido_status')
                
        if params.get('suido_use'):
            input_files['suido_use'] = concatenate(params.get('output_path'), params.get('suido_use'))
            suido_use_file = f"{output_directory}/suido_use_cleaned.csv"
      
        if params.get('touki'):
            input_files['touki'] = concatenate(params.get('output_path'), params.get('touki'))
            tatemono_file = f"{output_directory}/touki_cleaned.csv"
            input_source.append('touki')

        input_source.append('akiya_result')
        
        E012(input_files, output_directory, main_data_type, job_id, json.dumps(columns), params.get('db_path'))
        create_or_update_job(job_id, "25")

        output_path = e011(join_option, params, output_directory, job_id, columns)

        E013(
            suido_use_file,
            suido_status_file,
            juki_file,
            tatemono_file,
            params.get("reference_date"),
            search_period,
            output_directory,
            job_id,
            params.get('db_path')
        )

        main_csv = output_path

        progress_percent_job = 66
        create_or_update_job(job_id, progress_percent_job)
        progress_percent = 24 / len(input_source)
        output_e014 = f"{output_directory}/matched_data.csv"
        for item in input_source:
            sub_csv = f"{output_directory}/{item}_cleaned.csv"
            if item == 'suido_status':
                sub_csv = f"{output_directory}/suido_residence.csv"
            if item in ['juki', 'touki']:
                sub_csv = f"{output_directory}/{item}_residence.csv"

            E014(
                main_csv,
                sub_csv,
                "正規化住所",
                "正規化住所",
                output_e014,
                int(params.get('n_gram_size')),
                float(params.get('similarity_threshold')),
                1000,
                str(job_id),
                params.get('db_path'),
                [input_source_jp['geocoding'], input_source_jp[item]],
                progress_percent_job,
                progress_percent
            )
            main_csv = output_e014
            progress_percent_job = progress_percent_job + progress_percent
            create_or_update_job(job_id, progress_percent_job)

        filter_building_usage(output_e014, f"{output_directory}.csv", str(job_id), params.get('db_path'))

        create_or_update_job(job_id, "complete")
        create_job_results(job_id, f"{random_str}.csv")

    except Exception as e:
        if job_id:
            create_or_update_job(job_id, "error")
    finally:
        if output_directory and os.path.isdir(output_directory):
            shutil.rmtree(output_directory)

def e011(join_option, params, output_directory, job_id, columns):
    option = 0 if join_option == "交差結合" else 1

    gpkg_path = concatenate(params.get('output_path'), params.get("census", None))

    output_path = f"{output_directory}/FN007.csv"
    path_geocoding = f"{output_directory}/geocoding_cleaned.csv"
    task_id = None
    if job_id:
        task_id = create_or_update_job_task(
            job_id,
            progress_percent="0",
            preprocess_type="e011",
            error_code=None,
            error_msg=None,
            result=None,
        )

    output_path, count_data = FN007(
        gpkg_path,
        path_geocoding,
        '愛知県',
        '豊田市',
        output_path,
        columns.get('reverse_geocoded_columns', {})
    )

    if job_id and task_id:
        create_or_update_job(job_id, 30)
        create_or_update_job_task(
            job_id,
            progress_percent="20",
            preprocess_type="e011",
            error_code=None,
            error_msg=None,
            result=None,
            id=task_id,
        )

    residential_addresses = params.get('residential_addresses', None)
    columns = []
    if residential_addresses:
        residential_addresses = concatenate(params.get('output_path'), residential_addresses)
        column_residential_addresses = {
            "land_number_address": params.get("residential_addresses_columns", {}).get("land_number_address", "地番住所"),
            "residential_address": params.get("residential_addresses_columns", {}).get("residential_address", "住居表示住所")
        }
        output_path = FN006(output_path, 
                            residential_addresses, 
                            output_directory, 
                            column_residential_addresses
                            )
        if job_id and task_id:
            create_or_update_job(job_id, 35)
            create_or_update_job_task(
                job_id,
                progress_percent="40",
                preprocess_type="e011",
                error_code=None,
                error_msg=None,
                result=None,
                id=task_id,
            )
    else:
        columns.extend(['地番住所', '住居表示住所'])
        
    address_of_lot_number = params.get('address_of_lot_number', None)
    if address_of_lot_number:
        address_of_lot_number = concatenate(params.get('output_path'), address_of_lot_number)
        column_address_of_lot_number = {
            "lat": params.get("address_of_lot_number_columns", {}).get("lat", "緯度"),
            "lon": params.get("address_of_lot_number_columns", {}).get("lon", "経度"),
        }

        type_file = params.get('address_of_lot_number_type_file', 'csv')

        output_path, join_ratio, success_rate = process_spatial_join(
            output_path,
            address_of_lot_number,
            '愛知県',
            '豊田市',
            option,
            f"{output_directory}/DT118.csv",
            column_address_of_lot_number,
            type_file,
            "_address_of_lot_number",
            '地番住所-緯度経度対応データ'
        )

        res = {
            'joining_rate': join_ratio,
            'input_source': ["リバースジオコーディング済建物ポリゴンデータ", "地番住所-緯度経度対応データ"],
            'success_rate': success_rate
        }

        if job_id and task_id:
            create_or_update_job(job_id, 40)
            create_or_update_job_task(
                job_id,
                progress_percent="70",
                preprocess_type="e011",
                error_code=None,
                error_msg=None,
                result=json.dumps(res, ensure_ascii=False),
                id=task_id,
            )
    else:
        columns.extend(['地番住所_address_of_lot_number', '緯度_address_of_lot_number', '経度_address_of_lot_number'])

    building_type_determination = params.get('building_type_determination', None)
    if building_type_determination:
        building_type_determination = concatenate(params.get('output_path'), building_type_determination)
        if params.get("building_type_determination_type_file") == 'csv':
            column_building_type_determination = {
                "address": params.get("building_type_determination_columns", {}).get("address", "地番住所"),
                "building_type": params.get("building_type_determination_columns", {}).get("building_type", "建物種別"),
            }
            building_type_values = params.get("building_type_determination_values", [])

            output_path = merge_building_type_determination(
                output_path,
                building_type_determination,
                output_directory,
                column_building_type_determination,
                building_type_values
            )
            
        else:
            output_path, join_ratio = process_spatial_join(
                output_path,
                building_type_determination,
                '愛知県',
                '豊田市',
                option,
                f"{output_directory}/DT119.csv",
                None,
                params.get("building_type_determination_type_file", "shp"),
                "_building_type_determination",
                '建物種別判定データ'
            )
    else:
        columns.extend(['地番住所_building_type_determination', '緯度_building_type_determination', '経度_building_type_determination', '建物種別'])
    if len(columns) > 0:
        extend_columns(output_path, columns)

    create_or_update_job(job_id, 49)
    create_or_update_job_task(job_id, progress_percent="100", preprocess_type="e011", error_code=None, error_msg=None, result=json.dumps({}), id= task_id, is_finish=True)

    return output_path
        
if __name__ == "__main__":
    main()