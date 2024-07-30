"""
E014
* 座標（緯度，経度）形式で収録されていないデータに座標を付与する機能
"""

import io
import sys
import argparse
from typing import List, Tuple

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

OUTPUT_PATH = "juki_suido_touki_akiya_geocoded.csv"

def detect_encoding(file_path: str) -> str:
    encodings = ['utf-8', 'cp932', 'shift_jis']
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                f.read()
            return encoding
        except UnicodeDecodeError:
            continue
    raise ValueError("Unable to detect encoding. Supported encodings are UTF-8, CP932, and Shift-JIS.")

# ファイルの列名を取得、基準の列名選択に使用
def get_column_names(csv_file: io.BytesIO) -> List[str]:
    encoding = detect_encoding(csv_file.name)
    df = pd.read_csv(csv_file.name, encoding=encoding)
    return df.columns.tolist()

# 住所名寄せ処理
def embedding_address(main_csv: io.BytesIO, sub_csv: io.BytesIO, main_column: str, sub_column: str, merge_base: str, ngram: int = 2, threshold: float = 0.5) -> Tuple[str, str]:
    main_encoding = detect_encoding(main_csv.name)
    sub_encoding = detect_encoding(sub_csv.name)
    
    main_df = pd.read_csv(main_csv.name, encoding=main_encoding)
    sub_df = pd.read_csv(sub_csv.name, encoding=sub_encoding)

    # 結合元のファイルがmain, 結合対象のファイルがsub, 初めに読み込んだファイルを一旦mainにしているので、結合基準をsubにしてたら入れ替える
    if merge_base == sub_csv.name.split('/')[-1]:
        main_csv, sub_csv = sub_csv, main_csv
        main_column, sub_column = sub_column, main_column
        main_df, sub_df = sub_df, main_df

    data_rows = len(main_df)    # データの行数、完全一致割合の計算に使用

    # 結合元のファイル名を取得(suido.csvだったらsuidoだけ取り出して、列名を'水道使用量_suido'みたいにする)
    main_csv_name = main_csv.name.split('/')[-1].split('.')[0]
    sub_csv_name = sub_csv.name.split('/')[-1].split('.')[0]
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

    # 完全一致による結合
    df_merge = pd.merge(main_df, sub_df, on=main_column, how='inner')
    merged_rows = len(df_merge)    # 完全一致できた行数

    main_df = main_df[~main_df[main_column].isin(df_merge[main_column])]
    sub_df = sub_df[~sub_df[main_column].isin(df_merge[main_column])]
    main_df = main_df.reset_index(drop=True)
    sub_df = sub_df.reset_index(drop=True)

    # N-gramで類似度を計算、閾値以上の場合、結合対象の列を追加、閾値未満の場合は空白
    vectorizer = CountVectorizer(analyzer='char', ngram_range=(ngram, ngram))
    main_df_ngram_matrix = vectorizer.fit_transform(main_df[main_column].astype(str))
    sub_df_ngram_matrix = vectorizer.transform(sub_df[main_column].astype(str))
    similarities = cosine_similarity(main_df_ngram_matrix, sub_df_ngram_matrix)

    ngram_rows = 0  # ngramで名寄せできた行数をカウント
    
    for i in range(len(main_df)):
        top_indices = similarities[i].argsort()[-3:][::-1]
        if similarities[i][top_indices[0]] >= threshold:
            for col in sub_df.columns:
                main_df.at[i, col] = sub_df.iloc[top_indices[0]][col]
            ngram_rows += 1
        else:
            main_df.at[i, f'名寄せ元情報_{sub_csv_name}'] = ""
            main_df.at[i, sub_flag_name] = 0  # 名寄せできなかった行のflagを0にする

    result_df = pd.concat([df_merge, main_df], axis=0, ignore_index=True)

    # flag情報を最後に持ってくる
    result_df = result_df[[col for col in result_df.columns if col != main_flag_name] + [main_flag_name]]
    
    # カラム名にflagを含むカラムを最後に移動
    result_df[main_flag_name].fillna(0, inplace=True)
    result_df[sub_flag_name].fillna(0, inplace=True)
    result_df[main_flag_name] = result_df[main_flag_name].astype(int)
    result_df[sub_flag_name] = result_df[sub_flag_name].astype(int)
    
    flag_columns = [col for col in result_df.columns if 'flag' in col]
    other_columns = [col for col in result_df.columns if 'flag' not in col]
    result_df = result_df[other_columns + flag_columns]
    
    try:
        # まず、Shift-JISでの保存を試みる
        result_df.to_csv(OUTPUT_PATH, index=False, encoding='shift_jis')
    except UnicodeEncodeError:
        # Shift-JISが失敗した場合、CP932を使用する
        result_df.to_csv(OUTPUT_PATH, index=False, encoding='cp932')

    # 結果の表示
    threshold_match_ratio = f'緯度経度付与率: {(merged_rows + ngram_rows) / data_rows * 100:.2f}%'
    
    return OUTPUT_PATH, threshold_match_ratio

def main():
    parser = argparse.ArgumentParser(description='E014: 緯度経度付与システム')
    parser.add_argument('main_csv', help='結合元のCSVファイルパス')
    parser.add_argument('sub_csv', help='結合対象のCSVファイルパス')
    parser.add_argument('main_column', help='結合元の基準にする列名')
    parser.add_argument('sub_column', help='結合対象の基準にする列名')
    parser.add_argument('merge_base', help='結合の基準にするファイル名')
    parser.add_argument('--ngram', type=int, default=2, help='N-gram Size (default: 2)')
    parser.add_argument('--threshold', type=float, default=0.5, help='Similarity Threshold (default: 0.5)')

    args = parser.parse_args()

    output_file, results = embedding_address(
        args.main_csv,
        args.sub_csv,
        args.main_column,
        args.sub_column,
        args.merge_base,
        args.ngram,
        args.threshold
    )

    print(f"出力ファイル: {output_file}")
    print(results)

if __name__ == "__main__":
    main()