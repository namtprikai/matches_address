"""
# E022 空き家分類機能
判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズム（トレーニング済み）を実行する機能。
"""

import glob
import json
import os
import pickle
import shutil
import sqlite3
import argparse
import sys
import chardet
import tempfile
import zipfile 
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score
from datetime import datetime

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


# pandasの表示オプションを設定
pd.set_option('display.max_columns', None)

def setup_directory(base_dir):
    """
    作業ディレクトリを設定する

    Parameters
    ----------
    base_dir : str
        ベースディレクトリのパス

    Returns
    -------
    links04_path : str
        作成されたLinks04ディレクトリへのパス
    """
    # Links04フォルダのパスを生成
    links04_path = os.path.join(base_dir, 'Links04')

    # Links04フォルダが存在しない場合は作成
    os.makedirs(links04_path, exist_ok=True)

    # 現在の作業ディレクトリをLinks04フォルダに変更
    os.chdir(links04_path)

    # Links04ディレクトリへのパスを返す
    return links04_path

def detect_encoding(file_path):
    """
    ファイルのエンコーディングを検出する

    Parameters
    ----------
    file_path : str
        検出対象のファイルパス

    Returns
    -------
    encoding : str
        検出されたエンコーディング
    """
    # ファイルの内容を読み込む
    with open(file_path, 'rb') as file:
        raw_data = file.read()
    # エンコーディングを検出して返す
    result = chardet.detect(raw_data)
    return result['encoding']

def read_csv(path: str) -> pd.DataFrame:
    """
    CSVファイルを読み込む

    Parameters
    ----------
    path : str
        読み込むファイルのパス

    Returns
    -------
    pd.DataFrame
        読み込まれたデータフレーム、エラー時はNone
    """
    try:
        # ファイルの拡張子を取得し、小文字に変換
        file_extension = os.path.splitext(path)[1].lower()

        # CSVファイル以外の場合はエラーを発生させる
        if file_extension != '.csv':
            raise ValueError(f"CSVファイル以外は対応していません: {file_extension}")

        # 複数のエンコーディングを試行
        encodings = ['utf-8', 'utf-16', 'shift_jis', 'cp932']
        for encoding in encodings:
            try:
                # 各エンコーディングでファイルの読み込みを試みる
                return pd.read_csv(path, encoding=encoding)
            except UnicodeDecodeError:
                # デコードエラーが発生した場合、次のエンコーディングを試す
                continue

        # 自動でエンコーディングを検出し、再度読み込みを試みる
        detected_encoding = detect_encoding(path)
        if detected_encoding:
            return pd.read_csv(path, encoding=detected_encoding)

        # 適切なエンコーディングが見つからない場合、エラーを発生させる
        raise ValueError(f"適切なエンコーディングが見つかりませんでした: {path}")
    except Exception as e:
        # 何らかの例外が発生した場合、エラーメッセージを表示してNoneを返す
        print(f"ファイル {path} の読み込み中にエラーが発生しました: {e}")
        return None

def extract_zip(zip_file, extract_to):
    """
    zipファイルを解凍し、解凍されたファイルのパスを返す関数。
    
    Parameters:
    -----------
    zip_file : str
        zipファイルのパス。
    extract_to : str
        解凍先のディレクトリ。

    Returns:
    --------
    dict
        解凍された各ファイルのパス。
    """
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    files = os.listdir(extract_to)
    model_files = [os.path.join(extract_to, f) for f in files if f.endswith(".pkl")]
    return model_files

def load_models(model_zip):
    """
    ディレクトリ内のpickleファイルから訓練済みモデルを読み込む

    Parameters
    ----------
    directory : str
        モデルファイルが格納されているディレクトリへのパス

    Returns
    -------
    list
        読み込まれた訓練済みモデルのリスト
    """
    # 一時ディレクトリを作成
    temp_dir = os.path.join(os.getcwd(), "temp_files")
    os.makedirs(temp_dir, exist_ok=True)
    model_files = extract_zip(model_zip, temp_dir)
    models = []
    for model_file in model_files:
        # 各モデルファイルを読み込み、リストに追加
        with open(model_file, 'rb') as f:
            models.append(pickle.load(f))
    shutil.rmtree(temp_dir)
    return models

def check_features(new_data, required_features, outcome_variable):
    """
    新しいデータに必要な特徴量が含まれているかチェックし、余分な特徴量を削除する

    Parameters
    ----------
    new_data : pd.DataFrame
        新しいデータを含むDataFrame
    required_features : list
        必要な特徴量名のリスト
    outcome_variable : str
        目的変数の名前

    Returns
    -------
    tuple
        (pd.DataFrame, bool, str) - (調整されたDataFrame, 特徴量が一致する場合True, 一致しない場合のエラーメッセージ)
    """
    # 'geometry'列を必要な特徴量リストから除外
    required_features_without_geometry = [feature for feature in required_features if feature != 'geometry']
    all_required_features = required_features_without_geometry + [outcome_variable]

    # 新しいデータの特徴量を取得
    new_data_features = new_data.columns.tolist()
    missing_features = [feature for feature in all_required_features if feature not in new_data_features]
    extra_features = [feature for feature in new_data_features if feature not in all_required_features and feature != 'geometry']

    # 不足している特徴量と余分な特徴量を特定
    if missing_features:
        error_message = "学習に使用したデータと予測に使用するデータの列が一致しません!\n"
        error_message += f"不足している特徴量: {missing_features}\n"
        return new_data, False, error_message

    if extra_features:
        # 余分な特徴量がある場合、それらを削除
        new_data = new_data.drop(columns=extra_features)
        info_message = f"削除された余分な特徴量: {extra_features}\n"
        return new_data, True, info_message

    return new_data, True, ""

def predict(models, new_data, required_features, threshold):
    """
    訓練済みモデルを使用して予測を行う

    Parameters
    ----------
    models : list
        訓練済みモデルのリスト
    new_data : pd.DataFrame
        新しいデータを含むDataFrame
    required_features : list
        必要な特徴量名のリスト
    threshold : float
        二値分類の閾値

    Returns
    -------
    tuple
        (np.array, np.array) - (二値予測結果, 予測確率)
    """
    # 予測に使用する特徴量を選択
    X_pred = new_data[required_features]

    # 各モデルの予測確率の平均を計算
    test_preds_proba = np.mean([model.predict_proba(X_pred)[:, 1] for model in models], axis=0)

    # 閾値を適用して二値予測を行う
    test_preds = (test_preds_proba >= threshold).astype(int)

    return test_preds, test_preds_proba

def insert_sqlite_and_export(input_data, job_id=None):
    """
    指定されたデータをSQLiteデータベースに挿入し、同時にインポート可能な形式でファイルを出力する

    Parameters
    ----------
    input_data : pd.DataFrame
        SQLiteデータベースに挿入し、ファイル出力するデータを含むDataFrame
    Raises
    ------
    Exception
        データベースにデータを挿入またはファイル出力する際にエラーが発生した場合に例外を発生させる

    Notes
    -----
    - input_dataのカラム名は、日本語から英語に変換される
    - データは、年に基づいて命名されたテーブルに挿入され、ファイルも同名で出力される（例: D902_akiyaresult_2024.csv）
    - データベースに既にテーブルが存在する場合、そのテーブルは置き換えられる
    - 処理中にエラーが発生した場合、そのエラーメッセージが表示され、接続は必ず閉じられる
    """

    global conn
    try:
        # カラム名のマッピング
        mapping_header = {
            'residenceID': 'residence_id',
            'keycode': 'KEY_CODE',
            '基準日(データ正規化時に設定する値)': 'reference_date',
            '正規化住所': 'normalized_address',
            '正規化町字住所': 'S_NAME',
            '世帯コード': 'household_code',
            '世帯人数': 'household_size',
            '15歳未満人数': 'members_under_15',
            '15歳未満構成比': 'percentage_under_15',
            '15歳以上64歳以下人数': 'members_15_to_64',
            '15歳以上64歳以下構成比': 'percentage_15_to_64',
            '65歳以上人数': 'members_over_65',
            '65歳以上構成比': 'percentage_over_65',
            '男女比': 'gender_ratio',
            '住定期間': 'residence_duration',
            '水道番号_suido_residence': 'water_supply_number',
            '閉栓フラグ_suido_residence': 'water_disconnection_flag',
            '最大使用水量_suido_residence': 'max_water_usage',
            '平均使用水量_suido_residence': 'avg_water_usage',
            '最小使用水量_suido_residence': 'min_water_usage',
            '合計使用水量_suido_residence': 'total_water_usage',
            '名寄せ元情報_suido_residence': 'water_supply_source_info',
            '構造名称_touki_residence': 'structure_name',
            '登記日付_touki_residence': 'registration_date',
            '名寄せ元情報_touki_residence': 'registration_source_info',
            'geometry': 'geometry',
            'usage': 'usage',
            'fid': 'fid',
            'class': 'class',
            'gml_id': 'gml_id',
            'measuredHeight': 'measured_height',
            'measuredHeight_uom': 'measured_height_uom',
            'srcScale': 'src_scale',
            'geometrySrcDesc': 'geometry_src_desc',
            'thematicSrcDesc': 'thematic_src_desc',
            'lod1HeightType': 'lod1_height_type',
            'buildingID': 'building_id',
            'prefecture': 'prefecture',
            'city': 'city',
            'description': 'description',
            'rank': 'rank',
            'depth': 'depth',
            'depth_uom': 'depth_uom',
            'adminType': 'admin_type',
            'scale': 'scale',
            'duration': 'duration',
            'duration_uom': 'duration_uom',
            '建築確認申請の用途': 'building_use',
            '地上階数': 'floors_above_ground',
            '地下階数': 'floors_below_ground',
            'value': 'value',
            'value_uom': 'value_uom',
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|description': 'inland_flooding_risk_desc',
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|rank': 'inland_flooding_risk_rank',
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth': 'inland_flooding_risk_depth',
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth_uom': 'inland_flooding_risk_depth_uom',
            'name': 'name',
            'areaType': 'area_type',
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|description': 'river_flooding_risk_desc',
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|rank': 'river_flooding_risk_rank',
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth': 'river_flooding_risk_depth',
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth_uom': 'river_flooding_risk_depth_uom',
            'buildingDisasterRiskAttribute|BuildingLandSlideRiskAttribute|description': 'landslide_risk_desc',
            '大規模店舗名称': 'large_store_name',
            'appearanceSrcDesc': 'appearance_src_desc',
            'theme': 'theme',
            'imageURI': 'imageURI',
            'mimeType': 'mimeType',
            'textureCoordinates': '',
            'branchID': 'branch_id',
            'test_flg': 'is_test',
            'pred': 'predicted_label?',
            'pred_proba': 'predicted_probability',
            'ID_akiya_result_cleaned': 'vacant_house_id',
            '住所_akiya_result_cleaned': 'vacant_house_address',
            '経度_akiya_result_cleaned': 'vacant_house_longitude',
            '緯度_akiya_result_cleaned': 'vacant_house_latitude',
            '名寄せ元情報_akiya_result_cleaned': 'vacant_house_source_info',
            '住所_geocoding_cleaned': 'geocoded_address',
            'lat_geocoding_cleaned': 'geocoded_latitude',
            'lon_geocoding_cleaned': 'geocoded_longitude',
            '名寄せ元情報_geocoding_cleaned': 'geocoding_source_info',
            'suido_residence_flag': 'has_water_supply',
            'juki_residence_flag': 'has_juki_registry',
            'touki_residence_flag': 'has_touki_registry',
            'juki_suido_flag': 'has_juki_and_water',
            'akiya_result_cleaned_flag': 'has_vacant_result',
            'juki_suido_touki_flag': 'has_juki_water_property',
            'geocoding_cleaned_flag': 'has_geocoding',
            'juki_suido_touki_akiya_flag': 'has_juki_water_property_vacant'
        }
        # カラム名を変換
        input_data = input_data.rename(columns=mapping_header)
        current_year = datetime.now().year
        table_name = f"D902_akiyaresult_{current_year}"

        if job_id is None:
            # SQLiteにデータを挿入
            conn = sqlite3.connect('akiya_database.db')
            input_data.to_sql(table_name, conn, if_exists='replace', index=False)
            print(f"Inserted data into table {table_name}")

        # CSV形式でデータをファイルに保存
        output_file = f"{table_name}.csv"
        input_data.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"Data exported to CSV file {output_file}")

    except Exception as e:
        # エラー時の処理
        print("sql failed...")
        #print(f"Error when inserting to SQLite or exporting file: {e}")

    finally:
        if job_id is None and conn:
            conn.close()

def process_and_predict(input_folder, input_file, model_directory, threshold, output_file, required_features, outcome_variable, job_id=None , db_path=None):
    """
    入力データを処理し、予測を行い、結果を保存する
    """
    try:
        if db_path:
            connect_sqllite(db_path)
        task_id = None
        if job_id:
            task_id = create_or_update_job_task(job_id, progress_percent="0", preprocess_type="e022", error_code=None, result=None)
        # ディレクトリの設定
        print("ディレクトリを設定中...")
        # setup_directory(os.path.expanduser('~'))

        # 入力データの読み込み
        print("入力データを読み込み中...")
        input_path = os.path.join(input_folder, input_file)
        input_data = read_csv(input_path)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="20", preprocess_type="e022", error_code=None, result=None, id= task_id)
        # 予測用データ（REQUIRED_FEATURES）を準備するためのコピーを作成
        prediction_data = input_data.copy()

        # 'geometry'列を一時的に保存し、予測から除外
        geometry_data = prediction_data['geometry']
        prediction_data = prediction_data.drop(columns=['geometry'], errors='ignore')

        # 閉栓フラグをブール値に変換
        prediction_data["閉栓フラグ_suido_residence"] = prediction_data["閉栓フラグ_suido_residence"].map({"True": True, "False": False}).astype("bool")
        # '登記日付_touki_residence'をdatetime型に変換
        prediction_data['登記日付_touki_residence'] = pd.to_datetime(prediction_data['登記日付_touki_residence'], errors='coerce', format='%Y/%m/%d')

        # 基準日を設定
        base_date = pd.to_datetime('2023/03/20')

        # 基準日からの経過日数を計算
        prediction_data['登記日付_touki_residence'] = (base_date - prediction_data['登記日付_touki_residence']).dt.days
        if job_id:
            create_or_update_job_task(job_id, progress_percent="30", preprocess_type="e022", error_code=None, result=None, id= task_id)
        # 訓練済みモデルの読み込み
        print("訓練済みモデルを読み込み中...")
        models = load_models(model_directory)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="50", preprocess_type="e022", error_code=None, result=None, id= task_id)
        # 特徴量のチェック
        print("特徴量をチェック中...")
        prediction_data, features_match, message = check_features(prediction_data, required_features, outcome_variable)
        if not features_match:
            return message, None

        # 予測の実行
        print("予測中...")
        test_preds, test_preds_proba = predict(models, prediction_data, required_features, threshold)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="70", preprocess_type="e022", error_code=None, result=None, id= task_id)
        # 結果の保存
        print("結果を保存中...")

        # 元のinput_dataに予測結果を追加
        input_data['predicted_label'] = test_preds
        input_data['predicted_probability'] = test_preds_proba
        input_data['geometry'] = geometry_data
        output_dir = output_file.replace("D902.csv", "")
        os.makedirs(output_dir, exist_ok=True)

        #insert SQLite
        insert_sqlite_and_export(input_data, job_id)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="90", preprocess_type="e022", error_code=None, result=None, id= task_id)
        # 試行するエンコーディングのリスト
        encodings = ['shift_jis', 'cp932', 'utf-8']
        for encoding in encodings:
            try:
                # 各エンコーディングでCSVファイルとして保存を試みる
                input_data.to_csv(output_file, index=False, encoding=encoding)
                print(f"ファイルが {encoding} エンコーディングで正常に保存されました: {output_file}")

                if job_id:
                    create_or_update_job_task(job_id, progress_percent="100", preprocess_type="e022", error_code=None, result=json.dumps({}), id= task_id, is_finish=True)
                return f"予測結果が {output_file} に保存されました", output_file
            except Exception as e:
                # 保存中にエラーが発生した場合、エラーメッセージを表示して次のエンコーディングを試す
                print(f"ファイル {output_file} を {encoding} エンコーディングで保存中にエラーが発生しました: {e}")

        # すべてのエンコーディングで保存に失敗した場合のメッセージ
        if job_id:
            create_or_update_job_task(job_id, progress_percent="", preprocess_type="e022", error_code="e001", result=json.dumps({}), id= task_id, is_finish=True)
        return f"{output_file} への予測結果の保存に失敗しました", None
    except Exception as e:
        print("Exception", e)
        if task_id is not None:
            create_or_update_job_task(job_id, progress_percent="", preprocess_type="e022", error_code="e001", result=json.dumps({}), id= task_id, is_finish=True)
        raise Exception(e)

def main():
    # !!!!!! 引数で指定に要変更
    REQUIRED_FEATURES = [
        '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', '65歳以上人数', '15歳未満構成比', 
        '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', '住定期間', '最大使用水量_suido_residence', 
        '閉栓フラグ_suido_residence', '構造名称_touki_residence', '登記日付_touki_residence'
    ]
    # !!!!!! 引数で指定に要変更
    OUTCOME_VARIABLE = 'akiya_result_cleaned_flag'
    DEFAULT_THRESHOLD = 0.3
    OUTPUT_FILE = 'D902.csv'

    parser = argparse.ArgumentParser(description="E022 - 空き家分類機能")
    parser.add_argument("input_file", help="入力CSVファイルのパス (D901)")
    parser.add_argument("model_directory", help="モデルファイルが格納されているディレクトリーのパス")
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD, help="二値分類の閾値")
    parser.add_argument("--output_file", default=OUTPUT_FILE, help="出力CSVファイルのパス (D902)")
    parser.add_argument("--job_id", default=None)
    parser.add_argument("--db_path", default=None)
    
    args = parser.parse_args()

    input_folder = os.path.dirname(args.input_file)
    input_file = os.path.basename(args.input_file)

    result_message, output_path = process_and_predict(
        input_folder,
        input_file,
        args.model_directory,
        args.threshold,
        args.output_file,
        REQUIRED_FEATURES,
        OUTCOME_VARIABLE,
        args.job_id,
        args.db_path
    )

    print(result_message)
    if output_path:
        print(f"出力ファイル: {output_path}")
       

if __name__ == "__main__":
    main()
