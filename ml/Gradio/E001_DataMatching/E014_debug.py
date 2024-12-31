"""
# E014 テキストマッチング機能
* 任意のアセットに対しテキストマッチングによるインデキシング処理を行う機能。この機能には特定のワードをキーとした結合、除外、確率計算等が含まれる。
* テキストマッチングには完全一致と部分一致による結合方式を持つ。部分一致ではテキストマッチング度合いを示す類似率を算出する。ユーザーは部分一致において類似度の閾値を指定し、閾値以上の類似率のデータを結合する。

閾値以下の類似度の住所は"対応住所なし"として出力される.
入力は、住所を含むCSVファイル2つと、N-gramのサイズ、類似度の閾値を指定する.
出力は、2つのCSVファイルを住所をもとにマッチングした結果を含むCSVファイル.
"""

from typing import List, Tuple
import io
import os
import sys
import chardet
import gradio as gr
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix
# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E014.pyからすべての関数をインポート
from E001_DataMatching.E014 import *

# カスタムCSS
CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""


def generate_file_paths(citycode_value, targetyear_value, targedataset):
    """
    市区町村コードと対象年度に基づいてファイルパスを生成する
    """
    
    if targedataset == "住基-水道":
        main_csv = f'./data/{citycode_value}/E013/outputs/juki_residence_{targetyear_value}.csv'
        sub_csv = f'./data/{citycode_value}/E013/outputs/suido_residence_2023.csv'
        output_path = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        input_source = ["住基", "水道"]
    elif targedataset == "結果1-登記":
        main_csv = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        sub_csv = f'./data/{citycode_value}/E013/outputs/touki_residence.csv'
        output_path = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        input_source = ["住基", "建物情報"]
    elif targedataset == "結果2-空き家調査":
        main_csv = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        sub_csv = f'./data/{citycode_value}/E012/outputs/akiya_result_cleaned.csv'
        output_path = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        input_source = ["住基", "空き家調査"]
    elif targedataset == "結果3-ジオコーディング":
        main_csv = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        sub_csv = f'./data/{citycode_value}/E012/outputs/geocoding_cleaned.csv'
        output_path = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
        input_source = ["住基", "ジオコーディングデータ"]

    return main_csv, sub_csv, output_path, input_source

def update_column_dropdowns_and_radio_buttons(main_csv: io.BytesIO, sub_csv: io.BytesIO) -> Tuple[gr.Dropdown, gr.Dropdown, gr.Radio]:
    """
    ドロップダウンと選択肢を更新する
    
    Parameters
    ----------
    main_csv : io.BytesIO
        メインのCSVファイル
    sub_csv : io.BytesIO
        サブのCSVファイル
    
    Returns
    -------
    Tuple[gr.Dropdown, gr.Dropdown, gr.Radio]
        更新されたドロップダウンとラジオボタンの選択肢
    """  
    if main_csv is None or sub_csv is None:
        return gr.update(), gr.update(), gr.update()
    main_columns = get_column_names(main_csv.name)
    sub_columns = get_column_names(sub_csv.name)
    file_names = [main_csv.name.split('/')[-1], sub_csv.name.split('/')[-1]]
    return gr.update(choices=main_columns), gr.update(choices=sub_columns), gr.update(choices=file_names, value=file_names[0])

if __name__ == "__main__":
    # Gradioインターフェースの設定
    with gr.Blocks(css=CUSTOM_CSS) as e014:
        with gr.Row():
            with gr.Column():
                citycode = gr.Dropdown(
                    label="市区町村コードを選択（23201:豊橋市、23211:豊田市）", 
                    choices=["23201", "23211"], 
                    value="23201", 
                    interactive=True
                )
                
                targetyear = gr.Dropdown(
                    label="対象年度を選択", 
                    choices=["2020", "2021", "2022", "2023", "2024"], 
                    value="2023", 
                    interactive=True
                )
                targedataset = gr.Dropdown(
                    label="対象データセットを選択", 
                    choices=["住基-水道", "結果1-登記", "結果2-空き家調査", "結果3-ジオコーディング"], 
                    value="住基-水道", 
                    interactive=True
                )
        
        file_input_1 = gr.File(
            label="csvファイルを入力してください",
            value=f'./data/23211/E013/outputs/juki_residence_2023.csv',
            elem_id="csv"
        )
        file_input_2 = gr.File(
            label="csvファイルを入力してください",
            value=f'./data/23211/E013/outputs/suido_residence_2023.csv',
            elem_id="csv"
        )

        column_dropdown_1 = gr.Dropdown(label="結合元の基準にする列を選択してください", choices=['正規化住所'], value='正規化住所', interactive=True)
        column_dropdown_2 = gr.Dropdown(label="結合対象の基準にする列を選択してください", choices=['正規化住所'], value='正規化住所', interactive=True)
        merge_base = gr.Radio(choices=[], label="結合の基準にするファイルを選択してください")
        ngram_size = gr.Radio([1, 2, 3], value=2, label="N-gram Size")
        similarity_threshold = gr.Slider(0.0, 1.0, value=1.0, label="Similarity Threshold", step=0.05)

        match_button = gr.Button("名寄せ実行")
        
        output_file = gr.File(label="Matched Data CSV")
        results_text = gr.Textbox(label="結果")

        file_input_1.change(update_column_dropdowns_and_radio_buttons, inputs=[file_input_1, file_input_2], outputs=[column_dropdown_1, column_dropdown_2, merge_base])
        file_input_2.change(update_column_dropdowns_and_radio_buttons, inputs=[file_input_1, file_input_2], outputs=[column_dropdown_1, column_dropdown_2, merge_base])
        
        
        def on_submit(citycode_value, targetyear_value, targedataset_value, column_dropdown_1, column_dropdown_2, merge_base, ngram_size, similarity_threshold):
            # ディレクトリを作成
            os.makedirs(f'./data/{citycode_value}/E014/outputs/', exist_ok=True)

            # ファイルパスを生成
            main_csv, sub_csv, output_path, input_source = generate_file_paths(citycode_value, targetyear_value, targedataset_value)

            # 名寄せを実行
            return embedding_address(
                main_csv, 
                sub_csv, 
                column_dropdown_1, 
                column_dropdown_2,
                merge_base,
                output_path,
                ngram_size,
                similarity_threshold,
                1000,
                None,
                None,
                input_source
            )

        match_button.click(
            fn=on_submit,
            inputs=[
                citycode,
                targetyear,
                targedataset,  # 修正: targedatasetを引数として渡す
                column_dropdown_1,
                column_dropdown_2,
                merge_base,
                ngram_size,
                similarity_threshold
            ],
            outputs=[output_file, results_text]
        )

    e014.launch()
