
import argparse
import json
import os
import shutil
import sys
import uuid
from utils import *
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from src.E003_Summarization.E033 import processing as E033


def main():

    parser = argparse.ArgumentParser(description="IF004 データ出力")
    parser.add_argument("--parameters", type=str)
    args = parser.parse_args()
 
    json_dict = json.loads(args.parameters)

    params = {
        'db_path': json_dict.get('dataset_path'),
        'output_path': json_dict.get('output_path'),
        'input_file': json_dict.get('input_file', None),
        'output_format': json_dict.get('ouput_file_type', 'csv'),
        'target_crs': json_dict.get('output_coordinate', 'EPSG:4326 (WGS84)')
    }

    random_str = str(uuid.uuid4())
    output_directory = f"{params.get('output_path')}/{random_str}".replace("//", "/")

    try:
        connect_sqllite(params.get('db_path'))

        job_id = create_or_update_job(None ,"", "ml", os.getpid(), 0, args.parameters)
        file_path = f"{output_directory}.{params.get('output_format')}"
 
        params = {
            'input_file': params.get('input_file'),
            'output_format': params.get('output_format'),
            'target_crs': params.get('target_crs'),
            'output_path': file_path
        }
        E033(params, job_id, params.get('db_path'))
        create_or_update_job(job_id, "complete")

        create_job_results(job_id, f"{random_str}.{params.get('output_format')}")
    except Exception as e:
        print(e)
        if job_id:
            create_or_update_job(job_id, "error")
    finally:
        if output_directory and os.path.isdir(output_directory):
            shutil.rmtree(output_directory)

        
if __name__ == "__main__":
    main()