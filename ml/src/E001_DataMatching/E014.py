"""
# E014 テキストマッチング機能
* 任意のアセットに対しテキストマッチングによるインデキシング処理を行う機能。この機能には特定のワードをキーとした結合、除外、確率計算等が含まれる。
* テキストマッチングには完全一致と部分一致による結合方式を持つ。部分一致ではテキストマッチング度合いを示す類似率を算出する。ユーザーは部分一致において類似度の閾値を指定し、閾値以上の類似率のデータを結合する。

閾値以下の類似度の住所は"対応住所なし"として出力される.
入力は、住所を含むCSVファイル2つと、N-gramのサイズ、類似度の閾値を指定する.
出力は、2つのCSVファイルを住所をもとにマッチングした結果を含むCSVファイル.
"""

import json
import sys
from typing import List, Tuple
import io
import os
import re
import chardet
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
import numpy as np
import warnings

warnings.filterwarnings("ignore")
current_dir = os.path.dirname(os.path.abspath(__file__))
async_tasks_path = os.path.join(current_dir, '..', 'async_tasks')
if async_tasks_path not in sys.path:
    sys.path.append(async_tasks_path)

try:
    from utils import *
    from constants import *

except ImportError:
    sys.path.remove(async_tasks_path)
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
    from async_tasks.utils import *
    from async_tasks.constants import *


OUTPUT_PATH = "matched_data.csv"
ERROR_CODE=None
ERROR_MSG=None

@staticmethod
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
        raw_data = file.read(100)
    # エンコーディングを検出して返す
    result = chardet.detect(raw_data)
    return result['encoding']

def read_data(path: str, **kwargs) -> pd.DataFrame:
    """
    CSVファイルを読み込む
    
    Parameters
    ----------
    path : str
        読み込むファイルのパス
    **kwargs : dict
        pandas.read_csv に渡す追加のキーワード引数
    
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
            set_error(ERROR_00026, file_extension)
            raise ValueError(f"CSVファイル以外は対応していません: {file_extension}")
        
        # 複数のエンコーディングを試行                
        encodings = ['utf-8-sig']
        for encoding in encodings:
            try:
                # 各エンコーディングでファイルの読み込みを試みる
                return pd.read_csv(path, encoding=encoding, **kwargs)
            except UnicodeDecodeError:
                # デコードエラーが発生した場合、次のエンコーディングを試す
                continue
        
        # 自動でエンコーディングを検出し、再度読み込みを試みる
        detected_encoding = detect_encoding(path)
        if detected_encoding:
            return pd.read_csv(path, encoding=detected_encoding, **kwargs)
        set_error(ERROR_00027, path)
        # 適切なエンコーディングが見つからない場合、エラーを発生させる
        raise ValueError(f"適切なエンコーディングが見つかりませんでした: {path}")
    except Exception as e:
        # 何らかの例外が発生した場合、エラーメッセージを表示してNoneを返す
        if ERROR_CODE is None:
            set_error(ERROR_00011, path)
        raise

def get_column_names(csv_file: str) -> List[str]:
    """
    CSVファイルの列名を取得する
    
    Parameters
    ----------
    csv_file : str
        CSVファイルのパス
    
    Returns
    -------
    List[str]
        列名のリスト、エラー時は空のリスト
    """
    try:
        # CSVファイルを読み込む
        df = read_data(csv_file)
        # 列名のリストを返す
        return df.columns.tolist()
    except Exception as e:
        # エラーが発生した場合、メッセージを表示して空のリストを返す
        return []


def normalize_text(text):
    """
    テキストを正規化する（空白文字の除去）
    
    Parameters
    ----------
    text : str
        正規化するテキスト
    
    Returns
    -------
    str
        正規化されたテキスト
    """
    if pd.isna(text) or text is None:
        return text
    
    # 文字列に変換
    text = str(text)
    
    # 先頭末尾の空白文字を除去
    text = text.strip()
    
    # 連続する空白文字を単一の空白に置換
    text = re.sub(r'\s+', ' ', text)
    
    return text

def normalize_dates(df, column, formats=['%Y/%m/%d', '%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y', '%Y%m%d']):
    # Initialize the temporary column with NaN values
    temp_column = f'{column}_normalized'
    df[temp_column] = np.nan

    # Try the provided formats on the invalid values
    for fmt in formats:
        mask = df[temp_column].isna()
        df.loc[mask, temp_column] = pd.to_datetime(
            df.loc[mask, column], format=fmt, errors='coerce'
        )

    # Remove the time portion and keep only the date
    df[temp_column] = pd.to_datetime(df[temp_column], errors='coerce')
    df[column] = df[temp_column]
    
    return df.drop(f'{column}_normalized',axis=1)

def filter_building_usage(input_path: str, output_path: str, job_id: str, db_path: str):
    if db_path:
        connect_sqllite(db_path)
    task_id = None
    if job_id:
        create_or_update_job(job_id, '92')
        task_id = create_or_update_job_task(job_id, progress_percent="10", preprocess_type="e015", error_code=None, error_msg=None, result=None)

    df = read_data(input_path)
    df['buildingtype_determination_not_possible_flag'] = 1 - df['building_type'].astype(int)

    if job_id:
        create_or_update_job(job_id, '96')
        create_or_update_job_task(job_id, progress_percent="50", preprocess_type="e015", error_code=None, error_msg=None, result=None, id= task_id)

    df['single_story_row_house_flag'] = 0
    if 'usage' in df.columns:
        # Basic condition: usage must be '戸建' or '住宅'
        basic_condition = df['usage'].isin(['戸建', '住宅'])
        
        # Additional condition: 世帯コード or 水道番号_suido_residence duplicates on 正規化住所 greater than 2
        additional_condition = False
        
        if '正規化住所' in df.columns:
            # Check 世帯コード
            if '世帯コード' in df.columns:
                household_count = df.groupby('正規化住所')['世帯コード'].nunique()
                household_condition = df['正規化住所'].map(household_count) > 2
            
            # Check 水道番号_suido_residence
            if '水道番号_suido_residence' in df.columns:
                suido_count = df.groupby('正規化住所')['水道番号_suido_residence'].nunique()
                suido_condition = df['正規化住所'].map(suido_count) > 2
            
            # Combine conditions (OR between 世帯コード and 水道番号_suido_residence)
            if '世帯コード' in df.columns and '水道番号_suido_residence' in df.columns:
                additional_condition = household_condition | suido_condition
            elif '世帯コード' in df.columns:
                additional_condition = household_condition
            elif '水道番号_suido_residence' in df.columns:
                additional_condition = suido_condition
        
        # Apply condition: basic_condition AND additional_condition
        df.loc[basic_condition & additional_condition, 'single_story_row_house_flag'] = 1

    if job_id:
        create_or_update_job(job_id, '98')
        create_or_update_job_task(job_id, progress_percent="100", preprocess_type="e015", error_code=None, error_msg=None, result=None, id= task_id)
    
    save_csv(df, output_path)

def embedding_address(main_csv: io.BytesIO | str, sub_csv: io.BytesIO | str, main_column: str, sub_column: str, output_path:str, ngram: int = 0, threshold: float = 0.5, batch_size: int = 1000, job_id: str = None, db_path: str = None, input_source: list = [], progress_percent_job = 50, progress_percent = 0) -> Tuple[str, str]:
    """
    住所名寄せ処理を行う
    
    Parameters
    ----------
    main_csv : io.BytesIO
        メインのCSVファイル
    sub_csv : io.BytesIO
        サブのCSVファイル
    main_column : str
        メインファイルの結合キーとなる列名
    sub_column : str
        サブファイルの結合キーとなる列名
    ngram : int, optional
        N-gramのサイズ（デフォルト: 2）
    threshold : float, optional
        類似度の閾値（デフォルト: 0.5）
    
    Returns
    -------
    Tuple[str, str]
        結果ファイルのパスと結果の概要
    """
    task_id = None
    try:
        if db_path:
            connect_sqllite(db_path)
            progress_percent = progress_percent / 4
            progress_percent_job = progress_percent_job + progress_percent
        if job_id:
            create_or_update_job(job_id, progress_percent_job)
            task_id = create_or_update_job_task(job_id, progress_percent="0", preprocess_type="e014", error_code=None, error_msg=None, result=None)
      
        if output_path is None:
            output_path = OUTPUT_PATH
        
        output_dir = os.path.dirname(output_path)

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # CSVファイルを読み込む
        if hasattr(main_csv, 'name'):
            main_df = read_data(main_csv.name)
        else:
            main_df = read_data(main_csv)

        if hasattr(sub_csv, 'name'):
            sub_df = read_data(sub_csv.name)
        else:
            sub_df = read_data(sub_csv)

        # データの行数、完全一致割合の計算に使用
        data_rows = len(main_df)
        
        # アップロードされた元のファイル名を使用して拡張子を除去
        if hasattr(main_csv, 'name'):
            main_csv_name = os.path.splitext(os.path.basename(main_csv.name))[0]
        else:
            main_csv_name = os.path.splitext(os.path.basename(main_csv))[0]

        # アップロードされた元のファイル名を使用して拡張子を除去
        if hasattr(sub_csv, 'name'):
            sub_csv_name = os.path.splitext(os.path.basename(sub_csv.name))[0]
        else:
            sub_csv_name = os.path.splitext(os.path.basename(sub_csv))[0]

        # アンダーバーと数字のパターンを削除
        sub_csv_name = re.sub(r'_\d+$', '', sub_csv_name)

        
        # カラム名にファイル名を付与
        if sub_csv_name != 'juki_residence':
            sub_df.columns = [f"{col}_{sub_csv_name}" if col != sub_column else col for col in sub_df.columns]

        if main_csv_name in ['FN007', 'DT117', 'DT118', 'DT119']:
            main_csv_name = 'geocoding'

        # 名寄せが判断できるflagを設定
        main_flag_name = f'{main_csv_name}_flag'
        sub_flag_name = f'{sub_csv_name}_flag'
        # 初期値は全て1
        main_df[main_flag_name] = 0
        if '空き家調査' in input_source:
            main_df[sub_flag_name] = 1
        else:
            main_df[sub_flag_name] = 0

        # テキスト正規化を適用
        main_df[main_column] = main_df[main_column].apply(normalize_text)
        sub_df[sub_column] = sub_df[sub_column].apply(normalize_text)
        
        # 名寄せ対象になる行を元情報として残す
        sub_df[f'名寄せ元情報_{sub_csv_name}'] = sub_df[sub_column]
        sub_df.rename(columns={sub_column: main_column}, inplace=True)
        if job_id:
            progress_percent_job = progress_percent_job + progress_percent
            create_or_update_job(job_id, progress_percent_job)
            create_or_update_job_task(job_id, progress_percent="30", preprocess_type="e014", error_code=None, error_msg=None, result=None, id= task_id)
        
        # 完全一致による結合
        sub_df = sub_df.drop_duplicates(main_column, keep='first')
        sub_data_rows = len(sub_df)
        if ngram == 0:
            df_merge = main_df.merge(sub_df, on=main_column, how='left')
        else:
            df_merge = main_df.merge(sub_df, on=main_column, how='inner')

        merged_rows = len(df_merge)
        # N-gramで名寄せできた行数をカウント
        ngram_rows = 0
        similarity_scores = []  # 類似度スコアを保存するリスト
        matched_rows = 0
        
        # N-gramで使用されたsub recordsを追跡する変数を初期化
        used_sub_indices = set()
        
        # sub側の参加率計算用: 完全一致で使われたユニークなsub recordsをカウント
        if ngram == 0:
            # left joinの場合、マッチしたユニークなアドレス数をカウント
            matched_addresses = df_merge[df_merge[f'名寄せ元情報_{sub_csv_name}'].notna()][main_column]
            sub_matched_count = matched_addresses.nunique()
        else:
            # inner joinの場合、マッチしたユニークなアドレス数をカウント
            sub_matched_count = df_merge[main_column].nunique()

        if ngram != 0:
            # 未結合のデータを抽出
            main_df = main_df[~main_df[main_column].isin(df_merge[main_column])]
            sub_df = sub_df[~sub_df[main_column].isin(df_merge[main_column])]
            main_df = main_df.reset_index(drop=True)
            sub_df = sub_df.reset_index(drop=True)

            if len(main_df) > 0 and len(sub_df) > 0:
                if job_id:
                    progress_percent_job = progress_percent_job + progress_percent
                    create_or_update_job(job_id, progress_percent_job)
                    create_or_update_job_task(job_id, progress_percent="40", preprocess_type="e014", error_code=None, error_msg=None, result=None, id= task_id)

                # N-gramで類似度を計算する準備
                vectorizer = CountVectorizer(analyzer='char', ngram_range=(ngram, ngram))
                main_df_ngram_matrix = vectorizer.fit_transform(main_df[main_column].astype(str))
                sub_df_ngram_matrix = vectorizer.transform(sub_df[main_column].astype(str))

                # 疎行列に変換してメモリ効率を改善
                main_df_ngram_matrix = csr_matrix(main_df_ngram_matrix)
                sub_df_ngram_matrix = csr_matrix(sub_df_ngram_matrix)
                
                # N-gramで使用されたsub recordsを追跡
                used_sub_indices = set()

                # バッチ処理による類似度計算
                for start in range(0, main_df_ngram_matrix.shape[0], batch_size):
                    end = min(start + batch_size, main_df_ngram_matrix.shape[0])
        
                    # バッチ単位で類似度を計算
                    batch_similarities = cosine_similarity(main_df_ngram_matrix[start:end], sub_df_ngram_matrix)
                    
                    # バッチ内の各行ごとに処理
                    for i, similarities in enumerate(batch_similarities):
                        top_indices = similarities.argsort()[-3:][::-1]  # 上位3件を取得
                        best_sub_index = top_indices[0]
                        if similarities[best_sub_index] >= threshold:
                            row_index = start + i  # バッチの中での行番号をグローバルに変換
                            for col in sub_df.columns:
                                main_df.at[row_index, col] = sub_df.iloc[best_sub_index][col]
                            similarity_scores.append(similarities[best_sub_index])  # 類似度スコアを追加
                            ngram_rows += 1  # この行が正しく名寄せされた場合にカウント
                            used_sub_indices.add(best_sub_index)  # 使用されたsub recordを記録
                        else:
                            row_index = start + i
                            main_df.at[row_index, f'名寄せ元情報_{sub_csv_name}'] = ""
                            if '空き家調査' in input_source:
                                main_df.at[row_index, f'{sub_flag_name}'] = 0
                            else:
                                main_df.at[row_index, f'{sub_flag_name}'] = 1
                            similarity_scores.append(similarities[best_sub_index])  # 閾値未満の場合スコアは0
                        
                # 類似度スコアを結果データフレームに追加
                main_df[f'similarity_score_{sub_csv_name}'] = similarity_scores

                # 結果のデータフレームを作成
                result_df = pd.concat([df_merge, main_df], axis=0, ignore_index=True)
        
                # flag情報を最後に持ってくる
                result_df = result_df[[col for col in result_df.columns if col != main_flag_name] + [main_flag_name]]
                
                # カラム名にflagを含むカラムを最後に移動
                result_df[main_flag_name] = result_df[main_flag_name].astype(int)
                result_df[sub_flag_name] = result_df[sub_flag_name].astype(int)
                
                flag_columns = [col for col in result_df.columns if 'flag' in col]
                other_columns = [col for col in result_df.columns if 'flag' not in col]
                result_df = result_df[other_columns + flag_columns]

            else:
                result_df = df_merge
        else:
            result_df = df_merge

        # Check if 空き家調査 is in input_source, indicating this is the final data run of E014
        if '空き家調査' in input_source:
            # matched_data_flagを更新: 2つのflagがすべて0の場合は0、それ以外は1
            required_flags = ['suido_residence_flag', 'touki_residence_flag']
            existing_flags = [flag for flag in required_flags if flag in result_df.columns]
            
            if len(existing_flags) > 0:
                # matched_data_flagの計算
                def calculate_matched_flag(row):
                    # すべての存在するflagが0かチェック
                    all_zero = all(row.get(flag, 0) == 0 for flag in existing_flags)
                    return 0 if all_zero else 1
                
                result_df['matched_data_flag'] = result_df.apply(calculate_matched_flag, axis=1)

        if job_id:
            progress_percent_job = progress_percent_job + progress_percent
            create_or_update_job(job_id, progress_percent_job)
            create_or_update_job_task(job_id, progress_percent="90", preprocess_type="e014", error_code=None, error_msg=None, result=None, id= task_id)
        # 結果をCSVファイルとして保存
        saved_file_path = save_csv(result_df, output_path)
        
        # sub側の参加率を正しく計算
        ngram_sub_used = len(used_sub_indices) if ngram != 0 else 0
        total_sub_matched = sub_matched_count + ngram_sub_used
        
        # 論理的にありえない場合の修正
        if total_sub_matched > sub_data_rows:
            total_sub_matched = min(total_sub_matched, sub_data_rows)
        
        sub_participation_rate = total_sub_matched / sub_data_rows * 100 if sub_data_rows > 0 else 0
        
        res = {
            'joining_rate': sub_participation_rate,  # sub側の参加率
            'input_source': input_source,
            'success_rate': f"{total_sub_matched}件/{sub_data_rows}件中"
        }
        if job_id:
            create_or_update_job_task(job_id, progress_percent="100", preprocess_type="e014", error_code=None, error_msg=None, result=json.dumps(res, ensure_ascii=False), id= task_id, is_finish=True)

        return saved_file_path
    except Exception as e:
        if ERROR_CODE is None:
            set_error(ERROR_00013)
        if task_id:
            create_or_update_job_task(job_id, progress_percent="", preprocess_type="e014", error_code=ERROR_CODE, error_msg=ERROR_MSG, result=json.dumps({}), id= task_id, is_finish=True)
        raise Exception("テキストマッチング処理中にエラーが発生しました。")

def save_csv(df, path):
    """
    データフレームをCSVファイルとして保存する
    
    Parameters
    ----------
    df : pandas.DataFrame
        保存するデータフレーム
    path : str
        保存先のファイルパス
    """
    # 絶対パスに変換
    abs_path = os.path.abspath(path)
    
    # 試行するエンコーディングのリスト
    encodings = ['utf-8-sig']
    for encoding in encodings:
        try:
            # 各エンコーディングでCSVファイルとして保存を試みる
            df.to_csv(abs_path, encoding=encoding, index=False)
            return abs_path
        except Exception as e:
            set_error(ERROR_00012, abs_path, encoding)
    
    return None

def set_error(value, param_st1=None, param_st2=None):
    global ERROR_CODE
    global ERROR_MSG
    ERROR_CODE = value['code']
    if param_st1 is not None and param_st2 is not None:
        ERROR_MSG = value['message'].format(param_st1=param_st1, param_st2=param_st2)
    elif param_st1 is not None:
        ERROR_MSG = value['message'].format(param_st1=param_st1)
    else:
        ERROR_MSG = value['message']
