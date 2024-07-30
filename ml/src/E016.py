"""
# E016 テキストマッチング機能
* 任意のアセットに対しテキストマッチングによるインデキシング処理を行う機能。この機能には特定のワードをキーとした結合、除外、確率計算等が含まれる。
* テキストマッチングには完全一致と部分一致による結合方式を持つ。部分一致ではテキストマッチング度合いを示す類似率を算出する。ユーザーは部分一致において類似度の閾値を指定し、閾値以上の類似率のデータを結合する。

閾値以下の類似度の住所は"対応住所なし"として出力される.
入力は、住所を含むCSVファイル2つと、N-gramのサイズ、類似度の閾値を指定する.
出力は、2つのCSVファイルを住所をもとにマッチングした結果を含むCSVファイル.
"""

from typing import List, Tuple
import io

import gradio as gr
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# カスタムCSS
CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""

OUTPUT_PATH = "matched_data.csv"

# エンコーディングを検知
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
    result_df[main_flag_name] = result_df[main_flag_name].astype(int)
    result_df[sub_flag_name] = result_df[sub_flag_name].astype(int)
    
    flag_columns = [col for col in result_df.columns if 'flag' in col]
    other_columns = [col for col in result_df.columns if 'flag' not in col]
    result_df = result_df[other_columns + flag_columns]
    
    # 結果の保存、とりあえずファイル名は固定している
    try:
        # まず、Shift-JISでの保存を試みる
        result_df.to_csv(OUTPUT_PATH, index=False, encoding='shift_jis')
    except UnicodeEncodeError:
        # Shift-JISが失敗した場合、CP932を使用する
        result_df.to_csv(OUTPUT_PATH, index=False, encoding='cp932')

    # 結果の表示
    complete_match_ratio = f'完全一致割合: {merged_rows / data_rows * 100:.2f}%'
    threshold_match_ratio = f'閾値以上結合割合: {(merged_rows + ngram_rows) / data_rows * 100:.2f}%'
    
    return OUTPUT_PATH, f"{complete_match_ratio}\n{threshold_match_ratio}"

# ドロップダウンの選択肢を更新する
def update_column_dropdowns_and_radio_buttons(main_csv: io.BytesIO, sub_csv: io.BytesIO) -> Tuple[gr.Dropdown, gr.Dropdown, gr.Radio]:
    if main_csv is None or sub_csv is None:
        return gr.update(), gr.update(), gr.update()
    main_columns = get_column_names(main_csv)
    sub_columns = get_column_names(sub_csv)
    file_names = [main_csv.name.split('/')[-1], sub_csv.name.split('/')[-1]]
    return gr.update(choices=main_columns), gr.update(choices=sub_columns), gr.update(choices=file_names, value=file_names[0])

# Gradioインターフェースの設定
with gr.Blocks(css=CUSTOM_CSS) as e016:
    file_input_1 = gr.File(label="csvファイルを入力してください", elem_id="csv")
    file_input_2 = gr.File(label="csvファイルを入力してください", elem_id="csv")
    
    column_dropdown_1 = gr.Dropdown(label="結合元の基準にする列を選択してください")
    column_dropdown_2 = gr.Dropdown(label="結合対象の基準にする列を選択してください")
    
    merge_base = gr.Radio(choices=[], label="結合の基準にするファイルを選択してください")
    
    ngram_size = gr.Radio([1, 2, 3], value=2, label="N-gram Size")
    similarity_threshold = gr.Slider(0.0, 1.0, value=0.5, label="Similarity Threshold", step=0.05)
    
    match_button = gr.Button("名寄せ実行")
    
    output_file = gr.File(label="Matched Data CSV")
    results_text = gr.Textbox(label="結果")

    file_input_1.change(update_column_dropdowns_and_radio_buttons, inputs=[file_input_1, file_input_2], outputs=[column_dropdown_1, column_dropdown_2, merge_base])
    file_input_2.change(update_column_dropdowns_and_radio_buttons, inputs=[file_input_1, file_input_2], outputs=[column_dropdown_1, column_dropdown_2, merge_base])
    
    match_button.click(
        embedding_address,
        inputs=[
            file_input_1, 
            file_input_2, 
            column_dropdown_1, 
            column_dropdown_2,
            merge_base,
            ngram_size,
            similarity_threshold
        ],
        outputs=[output_file, results_text]
    )

e016.launch()