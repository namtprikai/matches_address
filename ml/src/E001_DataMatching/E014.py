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
import argparse
import chardet
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix

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

# カスタムCSS
CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""

OUTPUT_PATH = "matched_data.csv"

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
        raw_data = file.read()
    # エンコーディングを検出して返す
    result = chardet.detect(raw_data)
    return result['encoding']

def read_csv(path: str, **kwargs) -> pd.DataFrame:
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
            raise ValueError(f"CSVファイル以外は対応していません: {file_extension}")
        
        # 複数のエンコーディングを試行                
        encodings = ['shift_jis', 'cp932', 'utf-8', 'utf-16']
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
        
        # 適切なエンコーディングが見つからない場合、エラーを発生させる
        raise ValueError(f"適切なエンコーディングが見つかりませんでした: {path}")
    except Exception as e:
        # 何らかの例外が発生した場合、エラーメッセージを表示してNoneを返す
        print(f"ファイル {path} の読み込み中にエラーが発生しました: {e}")
        return None

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
        df = read_csv(csv_file)
        # 列名のリストを返す
        return df.columns.tolist()
    except Exception as e:
        # エラーが発生した場合、メッセージを表示して空のリストを返す
        print(f"ファイル {csv_file} の読み込み中にエラーが発生しました: {e}")
        return []

def embedding_address(main_csv: io.BytesIO, sub_csv: io.BytesIO, main_column: str, sub_column: str, merge_base: str, output_path:str, ngram: int = 2, threshold: float = 0.5, batch_size: int = 1000, job_id: str = None, db_path: str = None) -> Tuple[str, str]:   
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
    merge_base : str
        結合の基準となるファイル名
    ngram : int, optional
        N-gramのサイズ（デフォルト: 2）
    threshold : float, optional
        類似度の閾値（デフォルト: 0.5）
    
    Returns
    -------
    Tuple[str, str]
        結果ファイルのパスと結果の概要
    """
    try:
        if db_path:
            connect_sqllite(db_path)
        task_id = None
        if job_id:
            task_id = create_or_update_job_task(job_id, progress_percent="0", preprocess_type="e014", error_code=None, result=None)
      
        if output_path is None:
            output_path = OUTPUT_PATH
        
        output_dir = os.path.dirname(output_path)

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # CSVファイルを読み込む
        if hasattr(main_csv, 'name'):
            main_df = read_csv(main_csv.name)
        else:
            main_df = read_csv(main_csv)

        if hasattr(sub_csv, 'name'):
            sub_df = read_csv(sub_csv.name)
        else:
            sub_df = read_csv(sub_csv)

        # 結合元のファイルがmain, 結合対象のファイルがsub、初めに読み込んだファイルを一旦mainにしているので、結合基準をsubにしてたら入れ替える
        if hasattr(sub_csv, 'name') and merge_base == os.path.basename(sub_csv.name):
            main_csv, sub_csv = sub_csv, main_csv
            main_column, sub_column = sub_column, main_column
            main_df, sub_df = sub_df, main_df

        # データの行数、完全一致割合の計算に使用
        data_rows = len(main_df)
        sub_data_rows = len(sub_df)

        # アップロードされた元のファイル名を使用して拡張子を除去
        if hasattr(main_csv, 'name'):
            main_csv_name = os.path.splitext(os.path.basename(main_csv.name))[0]
        else:
            main_csv_name = os.path.splitext(os.path.basename(main_csv))[0]

        if hasattr(sub_csv, 'name'):
            sub_csv_name = os.path.splitext(os.path.basename(sub_csv.name))[0]
        else:
            sub_csv_name = os.path.splitext(os.path.basename(sub_csv))[0]
        
        # カラム名にファイル名を付与
        sub_df.columns = [f"{col}_{sub_csv_name}" if col != sub_column else col for col in sub_df.columns]
        
        # 名寄せが判断できるflagを設定
        main_flag_name = f'{main_csv_name}_flag'
        sub_flag_name = f'{sub_csv_name}_flag'
        # 初期値は全て1
        main_df[main_flag_name] = 1
        main_df[sub_flag_name] = 1
        
        # 名寄せ対象になる行を元情報として残す
        sub_df[f'名寄せ元情報_{sub_csv_name}'] = sub_df[sub_column]
        sub_df.rename(columns={sub_column: main_column}, inplace=True)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="30", preprocess_type="e014", error_code=None, result=None, id= task_id)
        # 完全一致による結合
        df_merge = pd.merge(main_df, sub_df, on=main_column, how='inner')
        merged_rows = len(df_merge)    # 完全一致できた行数
        
        # 未結合のデータを抽出
        main_df = main_df[~main_df[main_column].isin(df_merge[main_column])]
        sub_df = sub_df[~sub_df[main_column].isin(df_merge[main_column])]
        main_df = main_df.reset_index(drop=True)
        sub_df = sub_df.reset_index(drop=True)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="40", preprocess_type="e014", error_code=None, result=None, id= task_id)
        # N-gramで類似度を計算する準備
        vectorizer = CountVectorizer(analyzer='char', ngram_range=(ngram, ngram))
        main_df_ngram_matrix = vectorizer.fit_transform(main_df[main_column].astype(str))
        sub_df_ngram_matrix = vectorizer.transform(sub_df[main_column].astype(str))

        # 疎行列に変換してメモリ効率を改善
        main_df_ngram_matrix = csr_matrix(main_df_ngram_matrix)
        sub_df_ngram_matrix = csr_matrix(sub_df_ngram_matrix)
        if job_id:
            create_or_update_job_task(job_id, progress_percent="60", preprocess_type="e014", error_code=None, result=None, id= task_id)
        # N-gramで名寄せできた行数をカウント
        ngram_rows = 0
        # バッチ処理による類似度計算
        for start in range(0, main_df_ngram_matrix.shape[0], batch_size):
            end = min(start + batch_size, main_df_ngram_matrix.shape[0])

            # バッチ単位で類似度を計算
            batch_similarities = cosine_similarity(main_df_ngram_matrix[start:end], sub_df_ngram_matrix)
            
            # バッチ内の各行ごとに処理
            for i, similarities in enumerate(batch_similarities):
                top_indices = similarities.argsort()[-3:][::-1]  # 上位3件を取得

                if similarities[top_indices[0]] >= threshold:
                    row_index = start + i  # バッチの中での行番号をグローバルに変換
                    for col in sub_df.columns:
                        main_df.at[row_index, col] = sub_df.iloc[top_indices[0]][col]
                    ngram_rows += 1  # この行が正しく名寄せされた場合にカウント
                else:
                    row_index = start + i
                    main_df.at[row_index, f'名寄せ元情報_{sub_csv_name}'] = ""
                    main_df.at[row_index, f'{sub_flag_name}'] = 0
                
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
        if job_id:
            create_or_update_job_task(job_id, progress_percent="90", preprocess_type="e014", error_code=None, result=None, id= task_id)
        # 結果をCSVファイルとして保存
        saved_file_path = save_csv(result_df, output_path)
        unique_row = len(result_df[f'ID_{sub_csv_name}'].unique())
        # 結果の表示
        complete_match_ratio = f'結合元データとの完全一致割合: {merged_rows / data_rows * 100:.2f}%'
        threshold_match_ratio = f'結合元データとの閾値以上結合割合: {(merged_rows + ngram_rows) / data_rows * 100:.2f}%'
        sub_complete_match_ratio = f'結合先データとの完全一致割合: {merged_rows / sub_data_rows * 100:.2f}%'
        sub_threshold_match_ratio = f'結合先データとの閾値以上結合割合: {(unique_row) / sub_data_rows * 100:.2f}%'
        if job_id:
            create_or_update_job_task(job_id, progress_percent="100", preprocess_type="e014", error_code=None, result=json.dumps({}), id= task_id, is_finish=True)

        return saved_file_path, f"{complete_match_ratio}\n{threshold_match_ratio}\n{sub_complete_match_ratio}"
    except Exception as e:
        print("Exception", e)
        if task_id is not None:
            create_or_update_job_task(job_id, progress_percent="", preprocess_type="e014", error_code="e001", result=json.dumps({}), id= task_id, is_finish=True)

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
    encodings = ['shift_jis', 'cp932', 'utf-8']
    for encoding in encodings:
        try:
            # 各エンコーディングでCSVファイルとして保存を試みる
            df.to_csv(abs_path, encoding=encoding, index=False)
            print(f"ファイルが {encoding} エンコーディングで正常に保存されました: {abs_path}")
            return abs_path
        except Exception as e:
            print(f"ファイル {abs_path} を {encoding} エンコーディングで保存中にエラーが発生しました: {e}")
    
    print(f"ファイル {abs_path} をいずれのエンコーディングでも保存できませんでした。")
    return None

def main():
    parser = argparse.ArgumentParser(description="E014 - テキストマッチング機能")
    parser.add_argument("--main_csv", required=True, help="メインのCSVファイルのパス")
    parser.add_argument("--sub_csv", required=True, help="サブのCSVファイルのパス")
    parser.add_argument("--main_column", required=True, help="メインファイルの結合キーとなる列名")
    parser.add_argument("--sub_column", required=True, help="サブファイルの結合キーとなる列名")
    parser.add_argument("--merge_base", required=True, help="結合の基準となるファイル名")
    parser.add_argument("--ngram", type=int, default=2, help="N-gramのサイズ（デフォルト: 2）")
    parser.add_argument("--threshold", type=float, default=0.5, help="類似度の閾値（デフォルト: 0.5）")
    parser.add_argument("--output_directory", help="出力ファイルのパス", default=None)
    parser.add_argument("--job_id", default=None)
    parser.add_argument("--db_path", default=None)
    
    args = parser.parse_args()

    output_path, results = embedding_address(
        args.main_csv,
        args.sub_csv,
        args.main_column,
        args.sub_column,
        args.merge_base,
        args.output_directory,
        args.ngram,
        args.threshold,
        1000,
        args.job_id,
        args.db_path
    )
    
    print(f"結果ファイル: {output_path}")
    print(results)

if __name__ == "__main__":
    main()
