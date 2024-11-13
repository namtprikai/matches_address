
import argparse
import json
import os
import shutil
import sys
import uuid
from utils import *

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from src.E002_Classification.E022 import process_and_predict as E022
from src.E003_Summarization.E032 import process_summarization as E032
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
        'spatial_file': json_dict.get('spatial_file')
    }

    random_str = str(uuid.uuid4())
    output_directory = f"{params.get('output_path')}/{random_str}".replace("//", "/")

    try:
        connect_sqllite(params.get('db_path'))

        job_id = create_or_update_job(None ,"", "ml", args.parameters)
        file_path = f"{output_directory}/D902.csv"

        input_folder = os.path.dirname(params.get('area_grouping'))
        input_file = os.path.basename(params.get('area_grouping'))

        REQUIRED_FEATURES = [
            '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', '65歳以上人数', '15歳未満構成比', 
            '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', '住定期間', '最大使用水量_suido_residence', 
            '閉栓フラグ_suido_residence', '構造名称_touki_residence', '登記日付_touki_residence'
        ]
        OUTCOME_VARIABLE = 'akiya_result_cleaned_flag'

        E022(
            input_folder, 
            input_file,
            params.get('model_path'),
            float(params.get('threshold')),
            file_path,
            REQUIRED_FEATURES,
            OUTCOME_VARIABLE,
            str(job_id),
            params.get('db_path')
        )
        create_or_update_job(job_id, "50")

        E032(
            file_path,
            params.get('spatial_file'),
            output_directory,
            "KEY_CODE",
            str(job_id),
            params.get('db_path')
        )
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