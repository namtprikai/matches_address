
import argparse
import json
import os
import shutil
import subprocess
import sys
import uuid
from utils import *

e022_path = os.path.join(sys._MEIPASS, 'E002_Classification', 'E022.py') if hasattr(sys, '_MEIPASS') else "../src/E002_Classification/E022.py"
e032_path = os.path.join(sys._MEIPASS, 'E003_Summarization', 'E032.py') if hasattr(sys, '_MEIPASS') else "../src/E003_Summarization/E032.py"

def main():

    parser = argparse.ArgumentParser(description="E022,E032 空き家分析(判定)")
    parser.add_argument("--parameters", type=str)
    args = parser.parse_args()
 
    json_dict = json.loads(args.parameters)

    params = {
        'db_path': json_dict.get('dataset_path'),
        'output_path': json_dict.get('output_path'),
        'model_path': json_dict.get('model_path', None),
        'threshold': json_dict.get('settings', {}).get('threshold', "0.3"),
        'area_grouping': json_dict.get('area_grouping', {}).get('path', None),
        'area_grouping_columns': json_dict.get('area_grouping', {}).get('columns', {}),
        'spatial_file': json_dict.get('spatial_file', 'C:/rikai/source_code/Links04_Akiya_DX/code/02_py/Gradio/E001_DataMatching/23211/E016/inputs/r2ka23.gpkg')
    }

    random_str = str(uuid.uuid4())
    output_directory = f"{params.get('output_path')}/{random_str}".replace("//", "/")

    try:
        connect_sqllite(params.get('db_path'))

        job_id = create_or_update_job(None ,"", "ml", args.parameters)
        file_path = f"{output_directory}/D902.csv"
        args_e022 = [
            'python', e022_path,
            params.get('area_grouping'),
            params.get('model_path'),
            "--threshold", params.get('threshold'),
            "--output_file", file_path,
            "--job_id", str(job_id),
            "--db_path", params.get('db_path'),
        ]
        subprocess.run(args_e022)
        create_or_update_job(job_id, "50")

        args_e032 = [
            'python', e032_path,
            file_path,
            params.get('spatial_file'),
            "--key_column", "KEY_CODE",
            "--output_dir", output_directory,
            "--job_id", str(job_id),
            "--db_path", params.get('db_path')
        ]
        subprocess.run(args_e032)
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