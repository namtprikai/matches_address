
import argparse
import json
import os
import shutil
import subprocess
import sys
import uuid
from utils import *

e012_path = os.path.join(sys._MEIPASS, 'E001_DataMatching', 'E012.py') if hasattr(sys, '_MEIPASS') else "../src/E001_DataMatching/E012.py"
e013_path = os.path.join(sys._MEIPASS, 'E001_DataMatching', 'E013.py') if hasattr(sys, '_MEIPASS') else "../src/E001_DataMatching/E013.py"
e014_path = os.path.join(sys._MEIPASS, 'E001_DataMatching', 'E014.py') if hasattr(sys, '_MEIPASS') else "../src/E001_DataMatching/E014.py"
e016_path = os.path.join(sys._MEIPASS, 'E001_DataMatching', 'E016.py') if hasattr(sys, '_MEIPASS') else "../src/E001_DataMatching/E016.py"

def main():

    parser = argparse.ArgumentParser(description="E001 データ処理システム")
    parser.add_argument("--parameters", type=str)
    args = parser.parse_args()
 
    json_dict = json.loads(args.parameters)

    params = {
        'db_path': json_dict.get('database_path', None),
        'output_path': json_dict.get('output_path', '.'),
        'suido_status': json_dict.get('data', {}).get('water_status', {}).get('path', {}),
        'suido_status_columns': json_dict.get('data', {}).get('water_status', {}).get('columns', {}),
        'suido_use': json_dict.get('data', {}).get('water_supply_usage', {}).get('path', {}),
        'suido_use_columns': json_dict.get('data', {}).get('water_supply_usage', {}).get('columns', {}),
        'juki': json_dict.get('data', {}).get('resident_registry', {}).get('path', {}),
        'juki_columns': json_dict.get('data', {}).get('resident_registry', {}).get('columns', {}),
        'touki': json_dict.get('data', {}).get('land_registry', {}).get('path', {}),
        'touki_columns': json_dict.get('data', {}).get('land_registry', {}).get('columns', {}),
        'akiya_result': json_dict.get('data', {}).get('vacant_house', {}).get('path', {}),
        'akiya_result_columns': json_dict.get('data', {}).get('vacant_house', {}).get('columns', {}),
        'geocoding': json_dict.get('data', {}).get('geocoding', {}).get('path', {}),
        'census': json_dict.get('data', {}).get('census', {}).get('path', {}),
        'buidling_polygon': json_dict.get('data', {}).get('buidling_polygon', {}).get('path', {}),
        'urban_planning': json_dict.get('data', {}).get('urban_planning', {}).get('path', {}),
        'census': json_dict.get('data', {}).get('census', {}).get('path', {}),
        'n_gram_size': json_dict.get('settings', {}).get('advanced', {}).get('n_gram_size', "2"),
        'similarity_threshold': json_dict.get('settings', {}).get('advanced', {}).get('similarity_threshold', "0.95"),
        'joining_method': json_dict.get('settings', {}).get('advanced', {}).get('joining_method', ""),
        'reference_date': json_dict.get('settings', {}).get('reference_date', ""),
        'reference_data': json_dict.get('settings', {}).get('reference_data', "water_status")
    }

    columns = {
        "suido_status": {
            "suido_number": params.get("suido_status_columns", {}).get("water_supply_number"),
            "usage_status": params.get("suido_status_columns", {}).get("water_disconnection_flag"),
            "suido_status_address": params.get("suido_status_columns", {}).get("address"),
            "usage_start_date": params.get("suido_status_columns", {}).get("water_connection_flag"),
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
            "birth": params.get("juki_columns", {}).get("birthdate"),
            "gender": params.get("juki_columns", {}).get("gender"),
            "move_date": params.get("juki_columns", {}).get("resident_date"),
        },
        "touki": {
            "touki_address": params.get("touki_columns", {}).get("address"),
            "structure":  params.get("touki_columns", {}).get("structure_name"),
            "registration_date":  params.get("touki_columns", {}).get("registration_date")
        },
        "akiya_result": {
            "akiya_result_ID": params.get("akiya_result_columns", {}).get("vacant_house_id"),
            "akiya_result_address": params.get("akiya_result_columns", {}).get("address"),
            "akiya_result_lat":params.get("akiya_result_columns", {}).get("latitude"),
            "akiya_result_lon": params.get("akiya_result_columns", {}).get("longitude")
        },
        "geocoding": {
            "geocoding_address": "住所",
            "geocoding_lat": "lat",
            "geocofing_lon": "long",
        }
    }


    random_str = str(uuid.uuid4())
    output_directory = f"{params.get('output_path')}/{random_str}".replace("//", "/")
    join_option = "交差結合"
    if params.get('joining_method') == 'nearer':
        join_option = '最近傍結合'
    search_period = "1"
    input_zip_file = ""

    try:

        connect_sqllite(params.get('db_path'))
        job_id = create_or_update_job(None ,"", "ml", args.parameters)
        args_e012 = [
            "python", e012_path,
            "--suido_status", params.get('suido_status'),
            "--suido_use", params.get('suido_use'),
            "--juki", params.get('juki'),
            "--touki", params.get('touki'),
            "--akiya_result", params.get('akiya_result'),
            "--geocoding", params.get('geocoding'),
            "--output_directory", output_directory,
            "--job_id", str(job_id),
            "--db_path", params.get('db_path'),
            "--columns", json.dumps(columns),
        ]
        subprocess.run(args_e012)
        create_or_update_job(job_id, "25")

        args_e013 = [
            "python", e013_path,
            "--suido_use", f"{output_directory}/suido_use_cleaned.csv",
            "--suido_status", f"{output_directory}/suido_status_cleaned.csv",
            "--juki", f"{output_directory}/juki_cleaned.csv",
            "--tatemono_file", f"{output_directory}/touki_cleaned.csv",
            "--base_date", params.get("reference_date").replace("-", ""),
            "--search_period", search_period,
            "--output_directory", output_directory,
            "--job_id", str(job_id),
            "--db_path", params.get('db_path'),
            "--columns", json.dumps(columns),
        ]
        subprocess.run(args_e013)
        create_or_update_job(job_id, "50")

        args_e014 = [
            "python", e014_path,
            "--main_csv", f"{output_directory}/juki_residence.csv",
            "--sub_csv", f"{output_directory}/akiya_result_cleaned.csv",
            "--main_column", "正規化住所",
            "--sub_column", "正規化住所",
            "--merge_base", "",
            "--ngram", params.get('n_gram_size'),
            "--threshold", params.get('similarity_threshold'),
            "--output_directory", f"{output_directory}/matched_data.csv",
            "--job_id", str(job_id),
            "--db_path", params.get('db_path'),
        ]
        subprocess.run(args_e014)
        create_or_update_job(job_id, "75")

        output_path_e016 = output_directory.replace(f"/{random_str}", "")
        output_path_e016 = f"{output_path_e016}/{random_str}.csv"
        args_e016 = [
            "python", e016_path,
            "--tatemono", params.get('buidling_polygon'),
            "--water_supply", f"{output_directory}/matched_data.csv",
            "--gpkg", params.get("census"),
            "--ken", "愛知県",
            "--sikuchoson", "豊田市",
            "--join_option", join_option,
            "--output_format", "csv",
            "--output_path", output_path_e016,
            "--job_id", str(job_id),
            "--db_path", params.get('db_path'),
        ]

        if input_zip_file:
            input_zip = ["--input_zip_file", input_zip_file]
            args_e016.extend(input_zip)

        subprocess.run(args_e016)
        create_or_update_job(job_id, "complete")

        create_job_results(job_id, f"{random_str}.csv")
    except Exception as e:
        print(e)
        if job_id:
            create_or_update_job(job_id, "error")
    finally:
        if output_directory and os.path.isdir(output_directory):
            shutil.rmtree(output_directory)

        
if __name__ == "__main__":
    main()