from datetime import datetime
import math
import os
from concurrent.futures import ThreadPoolExecutor
import sys
import traceback
from types import SimpleNamespace
from typing import Any, Dict
import warnings
import json

import pandas as pd
from shapely import Point

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from FN015.types.match_level import MatchLevel
from FN015.models.pref_trie_finder import PrefTrieFinder
from FN015.models.county_and_city_trie_finder import CountyAndCityTrieFinder
from FN015.models.city_and_ward_trie_finder import CityAndWardTrieFinder
from FN015.models.kyoto_street_trie_finder import KyotoStreetTrieFinder
from FN015.models.oaza_cho_trie_finder import OazaChoTrieFinder
from FN015.models.ward_trie_finder import WardTrieFinder
from FN015.models.tokyo23_ward_trie_finder import Tokyo23WardTrieFinder
from FN015.models.tokyo23_town_finder import Tokyo23TownTrieFinder
from FN015.steps.city_and_ward_transform import CityAndWardTransform
from FN015.steps.county_and_city_transform import CountyAndCityTransform
from FN015.steps.kyoto_street_transform import KyotoStreetTransform
from FN015.steps.normalize_banchome_transform import (
    NormalizeBanchomeTransform,
)
from FN015.steps.normalize_transform import NormalizeTransform
from FN015.steps.oaza_chome_transform import OazaChomeTransform
from FN015.steps.parcel_transform import ParcelTransform
from FN015.steps.pref_transform import PrefTransform
from FN015.steps.rsdt_blk_transform import RsdtBlkTransform
from FN015.steps.tokyo23town_transform import Tokyo23TownTransform
from FN015.steps.tokyo23ward_transform import Tokyo23WardTransform
from FN015.steps.ward_transform import WardTransform
from FN015.services.utils_db import init, get_pref_list, close_connection

warnings.filterwarnings("ignore")
current_dir = os.path.dirname(os.path.abspath(__file__))
async_tasks_path = os.path.join(current_dir, "..", "async_tasks")
if async_tasks_path not in sys.path:
    sys.path.append(async_tasks_path)

try:
    from utils import *
    from constants import *
    from E001_DataMatching.E016 import process_census_data, process_spatial_join, read_file

except ImportError:
    sys.path.remove(async_tasks_path)
    sys.path.append(
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    )
    from async_tasks.utils import *
    from async_tasks.constants import *
    from src.E001_DataMatching.E016 import process_census_data, process_spatial_join, read_file


ERROR_CODE = None
ERROR_MSG = None

def handle(params: Dict[str, Any]):
    join_ratio = 100
    try:
        path_abrg_geocode, task_id = create(params)
        job_id = params.get("job_id")
        if job_id and task_id:
            create_or_update_job(job_id, "40")

        output_directory = params.get("abrg_dir", "")
        output_path = f"{output_directory}/process_census_data.csv"

        output_path, len_result_add_keycode = process_census_data(
            params.get("census_path"),
            path_abrg_geocode,
            params.get("ken"),
            params.get("sikuchoson"),
            output_path,
        )

        if job_id and task_id:
            create_or_update_job(job_id, "45")
            create_or_update_job_task(
                job_id,
                progress_percent="75",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=json.dumps({}),
                id=task_id,
                is_finish=True,
            )

        if (params.get("residential_addresses")):
            residential_addresses = read_file(params.get("residential_addresses"), usecols=params.get("columns", {}).get("residential_addresses", {}).values())
            residential_addresses.rename(
                columns={col: f"{col}_residential_addresses" for col in residential_addresses.columns},
                inplace=True
            )
            address_matching_result = read_file(output_path)
            right_key = params.get("columns", {}).get("residential_addresses", {}).get("land_number_address", "地番住所")
            right_key = f"{right_key}_residential_addresses"
            result = address_matching_result.merge(residential_addresses, left_on='名寄せ元情報_geocoding', right_on=right_key, how='left')
            result[right_key] = result.apply(
                lambda row: '' if pd.notna(row[right_key]) else row['名寄せ元情報_geocoding'],
                axis=1
            )
            output_path = f"{output_directory}/DT215.csv"
            result.to_csv(output_path, index=False, encoding='utf-8-sig')

        if job_id and task_id:
            create_or_update_job_task(
                job_id,
                progress_percent="80",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=json.dumps({}),
                id=task_id,
                is_finish=True,
            )

        if (params.get("address_of_lot_number")):
            output_path, join_ratio = process_spatial_join(
                output_path,
                params.get("address_of_lot_number"),
                params.get("ken"),
                params.get("sikuchoson"),
                params.get("option"),
                f"{output_directory}/address_of_lot_number.csv",
                params.get("columns", {}),
                'csv',
                "_address_of_lot_number"
            )
        
        if job_id and task_id:
            create_or_update_job_task(
                job_id,
                progress_percent="85",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=json.dumps({}),
                id=task_id,
                is_finish=True,
            )

        if params.get("building_type_determination"):
            if params.get("building_type_determination_type_file") == 'csv':
                building_type_determination = read_file(params.get("building_type_determination"), usecols=params.get("columns", {}).get("building_type_determination", {}).values())
                address_matching_result = read_file(output_path)
                building_type_determination.rename(
                    columns={col: f"{col}_building_type_determination" for col in building_type_determination.columns},
                    inplace=True
                )
                right_key = params.get("columns", {}).get("building_type_determination", {}).get("address", "地番住所")
                right_key = f"{right_key}_building_type_determination"
                result = address_matching_result.merge(building_type_determination, left_on='名寄せ元情報_geocoding', right_on=right_key, how='left')
                output_path = f"{output_directory}/building_type_determination.csv"
                result.to_csv(output_path, index=False, encoding='utf-8-sig')
            else:
                output_path, join_ratio = process_spatial_join(
                    output_path,
                    params.get("building_type_determination"),
                    params.get("ken"),
                    params.get("sikuchoson"),
                    params.get("option"),
                    f"{output_directory}/building_type_determination.csv",
                    None,
                    params.get("building_type_determination_type_file", "shp"),
                    "_building_type_determination"
                )

        if job_id and task_id:
            create_or_update_job_task(
                job_id,
                progress_percent="95",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=json.dumps({}),
                id=task_id,
                is_finish=True,
            )
            
        res = read_file(output_path)
        first_geom = None
        if 'geometry' in res.columns:
            first_geom = res['geometry'].dropna().iloc[0]

        if not first_geom or 'POINT' not in first_geom:
            res = res.rename(columns={'geometry': 'geometry_plateau'}, errors='ignore')
            res = res.rename(columns={'geometry_point': 'geometry'}, errors='ignore')
            res = res.rename(columns={'geometry_polygon': 'geometry_plateau'}, errors='ignore')
            
            if 'geometry' not in res.columns:
                res['geometry'] = res.apply(
                    lambda row: Point(row['lon_geocoding'], row['lat_geocoding'])
                    if pd.notna(row['lat_geocoding']) and pd.notna(row['lon_geocoding'])
                    else None, axis=1
                )
        else:
            res = res.rename(columns={'geometry_polygon': 'geometry_plateau'}, errors='ignore')

        res.to_csv(f"{output_directory}/geocoding_cleaned.csv", index=False, encoding='utf-8-sig')

        result = {
            "joining_rate": join_ratio,
            "input_source": params.get("input_source", []),
            'success_rate': f"{len(res)}件/{len_result_add_keycode}件中"
        }
        
        if job_id and task_id:
            create_or_update_job(job_id, "45")
            create_or_update_job_task(
                job_id,
                progress_percent="100",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=json.dumps(result, ensure_ascii=False),
                id=task_id,
                is_finish=True,
            )
    except Exception as e:
        print(f"Error in handle: {e}")
        traceback.print_exc()
        if ERROR_CODE is None:
            set_error(ERROR_00045)
        raise e


def create(params: Dict[str, Any]):
    task_id = None
    try:
        abrg_data = params["abrg_data"]
        path_sql = params["path_sql_abrg"]
        abrg_dir = params["abrg_dir"]
        input_path = params["input"]
        job_id = params["job_id"]
        db_path = params["db_path"]
        columns = params["columns"]

        if db_path:
            connect_sqllite(db_path)
        if job_id:
            task_id = create_or_update_job_task(
                job_id,
                progress_percent="0",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=None,
            )

        init(path_sql, abrg_data)
        if job_id:
            create_or_update_job(job_id, "26")
            create_or_update_job_task(
                job_id,
                progress_percent="10",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=None,
                id=task_id,
            )

        trie_data = {}
        trie_data["pref"] = PrefTrieFinder.load_data_file(params)
        trie_data["county_and_city"] = CountyAndCityTrieFinder.load_data_file(params)
        trie_data["city_and_ward"] = CityAndWardTrieFinder.load_data_file(params)
        trie_data["kyoto_street"] = KyotoStreetTrieFinder.load_data_file(params)
        oaza_chomes = {}
        if job_id:
            create_or_update_job(job_id, "28")
            create_or_update_job_task(
                job_id,
                progress_percent="20",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=None,
                id=task_id,
            )

        df = pd.read_csv(abrg_data["mt_parcel_city"], header=0, nrows=1)
        lg_code_parcel = df["lg_code"].iloc[0]

        pref_list = get_pref_list()
        for pref in pref_list.itertuples(index=False):
            oaza = OazaChoTrieFinder.load_data_file(
                params,
                data_oaza={"lg_code": pref.lg_code, "lg_code_parcel": lg_code_parcel},
            )
            if oaza:
                oaza_chomes[pref.lg_code] = OazaChoTrieFinder(oaza)

        trie_data["ward"] = WardTrieFinder.load_data_file(params)
        trie_data["tokyo23_ward"] = Tokyo23WardTrieFinder.load_data_file(params)
        trie_data["tokyo23_town"] = Tokyo23TownTrieFinder.load_data_file(params)
        col_address = columns.get("geocoding", {}).get("geocoding_address", "new_address")

        df = read_file(input_path)
        df = df.dropna(subset=[col_address])
        df = df[df[col_address].astype(str).str.strip() != ""]
        data_input = df.to_dict(orient="records")

        if job_id:
            create_or_update_job(job_id, "30")
            create_or_update_job_task(
                job_id,
                progress_percent="30",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=None,
                id=task_id,
            )

        normalize_transform = NormalizeTransform()
        normalize_banchome_transform = NormalizeBanchomeTransform()
        pref_transform = PrefTransform(PrefTrieFinder(trie_data["pref"]))
        county_and_city_transform = CountyAndCityTransform(
            CountyAndCityTrieFinder(trie_data["county_and_city"])
        )
        city_and_ward_transform = CityAndWardTransform(
            CityAndWardTrieFinder(trie_data["city_and_ward"])
        )
        ward_transform = WardTransform(WardTrieFinder(trie_data["ward"]))
        tokyo23_town_transform = Tokyo23TownTransform(
            Tokyo23TownTrieFinder(trie_data["tokyo23_town"])
        )
        tokyo23_ward_transform = Tokyo23WardTransform(
            Tokyo23WardTrieFinder(trie_data["tokyo23_ward"])
        )
        kyoto_street_transform = KyotoStreetTransform(
            KyotoStreetTrieFinder(trie_data["kyoto_street"])
        )
        oaza_chome_transform = OazaChomeTransform(oaza_chomes)
        rsdt_blk_transform = RsdtBlkTransform()
        parcel_transform = ParcelTransform()

        transforms = [
            normalize_transform,
            normalize_banchome_transform,
            pref_transform,
            county_and_city_transform,
            city_and_ward_transform,
            ward_transform,
            tokyo23_town_transform,
            tokyo23_ward_transform,
            kyoto_street_transform,
            oaza_chome_transform,
            rsdt_blk_transform,
            parcel_transform,
        ]

        if job_id:
            create_or_update_job(job_id, "31")
            create_or_update_job_task(
                job_id,
                progress_percent="40",
                preprocess_type="fn015",
                error_code=None,
                error_msg=None,
                result=None,
                id=task_id,
            )

        path_output = os.path.join(abrg_dir, "abrg_geocode.csv")
        first_batch = True

        indexed_data_input = list(enumerate(data_input))

        max_workers = min(16, int(os.cpu_count() or 1) + 4)
        BATCH_SIZE = 5000
        if len(indexed_data_input) < BATCH_SIZE:
            try:
                BATCH_SIZE = max(1, len(indexed_data_input) // 10)
            except Exception as e:
                BATCH_SIZE = len(indexed_data_input)

        total_rows = len(data_input)
        processed_rows = 0
        last_updated_progress = 40
        progress_percent_job = 31

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for i, start in enumerate(range(0, len(data_input), BATCH_SIZE)):
                end = min(start + BATCH_SIZE, len(data_input))
                chunk = indexed_data_input[start:end]
                args_list = [
                    (index, data, transforms, col_address) for index, data in chunk
                ]
                output_rows_with_index = []
                for result in executor.map(lambda args: process_one(*args), args_list):
                    output_rows_with_index.append(result)
                output_rows_with_index.sort(key=lambda x: x[0])
                output_rows = [
                    row for _, row in output_rows_with_index if row is not None
                ]
                df_out = pd.DataFrame(output_rows)
                df_out.to_csv(path_output, mode="a", header=first_batch, index=False)
                first_batch = False

                processed_rows += len(chunk)
                current_progress = 40 + math.floor((processed_rows / total_rows) * 30)
                if (
                    current_progress - last_updated_progress >= 10
                    or current_progress == 70
                ):
                    if job_id:
                        create_or_update_job_task(
                            job_id,
                            progress_percent=str(current_progress),
                            preprocess_type="fn015",
                            error_code=None,
                            error_msg=None,
                            result=None,
                            id=task_id,
                        )
                        progress_percent_job = progress_percent_job + 1
                        create_or_update_job(job_id, str(progress_percent_job))
                    last_updated_progress = current_progress

        close_connection()
        return path_output, task_id
    except Exception as e:
        print(f"Error in create: {e}")
        traceback.print_exc()
        if ERROR_CODE is None:
            set_error(ERROR_00045)
        if task_id is not None:
            create_or_update_job_task(
                job_id,
                progress_percent="",
                preprocess_type="fn015",
                error_code=ERROR_CODE,
                error_msg=ERROR_MSG,
                result=json.dumps({}),
                id=task_id,
                is_finish=True,
            )
        raise e


def process_one(idx, data, transforms, col_address):
    try:
        query = SimpleNamespace(data=SimpleNamespace(address=data[col_address]))
        for transform in transforms:
            query = transform.transform(query)
        values = list(query.values())
        best_item = max(
            values, key=lambda x: x.match_level.value.num if x.match_level else 0
        )
        best_dict = best_item.__dict__.copy()
        output = schema_output(best_dict, data, col_address)
        return idx, output
    except Exception as e:
        print(f"[Thread Error] Error in process_one at index {idx}-{data[col_address]}: {e}")
        traceback.print_exc()
        return idx, None


def schema_output(best_dict, data, col_address):
    output = {}
    exclude_keys = [
        "address", "latitude", "longitude", "fullAddress", "緯度", "経度",
        "match_level", "coordinate_level", "new_address", "score", "type",
        "pref", "county", "ward", "oaza_cho", "chome", "koaza",
        "blk_num", "rsdt_num", "rsdt_num2",
        "prc_num1", "prc_num2", "prc_num3"
    ]

    if hasattr(data, "drop"):
        cleaned_data = data.drop(exclude_keys, errors='ignore').to_dict()
    else:
        cleaned_data = {k: v for k, v in data.items() if k not in exclude_keys}

    output.update(cleaned_data)

    output["名寄せ元情報_geocoding"] = data[col_address]
    output["match_level"] = best_dict["match_level"].value.str
    output["coordinate_level"] = best_dict["coordinate_level"].value.str
    output["lat_geocoding"] = best_dict.get("rep_lat", None)
    output["lon_geocoding"] = best_dict.get("rep_lon", None)
    output["pref"] = best_dict.get("pref", None)
    output["city"] = best_dict.get("city", None)
    output["lg_code"] = best_dict.get("lg_code", None)
    output["county"] = best_dict.get("county", None)
    output["ward"] = best_dict.get("ward", None)
    output["machiaza_id"] = best_dict.get("machiaza_id", None)
    output["oaza_cho"] = best_dict.get("oaza_cho", None)
    output["chome"] = best_dict.get("chome", None)
    output["koaza"] = best_dict.get("koaza", None)
    output["rsdt_addr_flg"] = best_dict.get("rsdt_addr_flg", None)
    output["blk_num"] = best_dict.get("blk_num", None)
    output["blk_id"] = best_dict.get("blk_id", None)
    output["rsdt_id"] = best_dict.get("rsdt_id", None)
    output["rsdt_num"] = best_dict.get("rsdt_num", None)
    output["rsdt2_id"] = best_dict.get("rsdt2_id", None)
    output["rsdt_num2"] = best_dict.get("rsdt_num2", None)
    output["prc_num1"] = best_dict.get("prc_num1", None)
    output["prc_num2"] = best_dict.get("prc_num2", None)
    output["prc_num3"] = best_dict.get("prc_num3", None)
    output["prc_id"] = best_dict.get("prc_id", None)
    output["pref_key"] = best_dict.get("pref_key", None)

    if "formatted" in best_dict:
        formatted = best_dict["formatted"]
        score = formatted.get("score", "")
        output["住所_geocoding"] = formatted.get("address", "")
        output["正規化住所"] = formatted.get("address", "")
        if score:
            num = float(score)
            rounded = math.ceil(num * 100) / 100
            output["score"] = rounded
    else:
        output["住所_geocoding"] = data["address"]
        output["正規化住所"] = data["address"]
        output["score"] = 0.0

    if (
        not best_dict["match_level"]
        or best_dict["match_level"].value.num == MatchLevel.UNKNOWN.value.num
    ):
        output["score"] = 0.0

    return output


def set_error(value, param_st1=None, param_st2=None):
    global ERROR_CODE
    global ERROR_MSG
    ERROR_CODE = value["code"]
    if param_st1 is not None and param_st2 is not None:
        ERROR_MSG = value["message"].format(param_st1=param_st1, param_st2=param_st2)
    elif param_st1 is not None:
        ERROR_MSG = value["message"].format(param_st1=param_st1)
    else:
        ERROR_MSG = value["message"]
