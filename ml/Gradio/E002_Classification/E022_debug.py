"""
# E022 空き家分類機能
判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズム（トレーニング済み）を実行する機能。
"""

import glob
import os
import pickle
import sqlite3
import tempfile
import zipfile 
import sys
import chardet
import gradio as gr
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score
from datetime import datetime
# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E012.pyからすべての関数をインポート
from E002_Classification.E022 import *

# pandasの表示オプションを設定
pd.set_option('display.max_columns', None)

CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""


DEFAULT_THRESHOLD = 0.3

def generate_file_paths(citycode_value, targetyear_value):
    """
    市区町村コードと対象年度に基づいてファイルパスを生成する
    """
    
    input_folder = f'../E001_DataMatching/data/{citycode_value}/E016/outputs'
    input_file = f'D901_{targetyear_value}.csv'
    models = f'./data/{citycode_value}/E021/outputs/models.zip'
    output_path = f'./data/{citycode_value}/E022/outputs/D902_{targetyear_value}.csv'
    return input_folder, input_file, models, output_path

def on_submit(citycode_value, targetyear_value, threshold):
    input_folder, input_file, models, output_path = generate_file_paths(citycode_value, targetyear_value)
    required_features = [
        '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', 
        '65歳以上人数', '15歳未満構成比', '15歳以上64歳以下構成比', '65歳以上構成比', '最大年齢', '最小年齢', '男女比', 
        '住定期間', '水道使用量変化率_suido_residence', '最大使用水量_suido_residence', '合計使用水量_suido_residence', '閉栓フラグ_suido_residence', '構造名称_touki_residence', 
        '登記日付_touki_residence'
    ]
    outcome_variable = 'akiya_result_cleaned_flag'
    return process_and_predict(
        input_folder
        , input_file
        , models
        , threshold
        , output_path
        , required_features
        , outcome_variable
        , targetyear_value
    )

if __name__ == "__main__":
    

    # Gradioインターフェースの設定
    with gr.Blocks(css=CUSTOM_CSS) as iface:
        # タイトルセクション
        gr.Markdown("# E022 - 空き家分類機能")
        gr.Markdown("判定用データをインプットとして、建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズム（トレーニング済み）を実行する機能")

        # 市区町村コードと対象年度の入力セクション
        with gr.Row():
            with gr.Column():
                citycode = gr.Dropdown(
                    label="市区町村コードを選択（23201:豊橋市、23211:豊田市）", 
                    choices=["23201", "23211"], 
                    value="23201", 
                    interactive=True
                )
            with gr.Column():
                targetyear = gr.Dropdown(
                    label="対象年度を選択", 
                    choices=["2020", "2021", "2022", "2023", "2024"], 
                    value="2023", 
                    interactive=True
                )
        
        # ファイルアップロードと閾値スライダーのセクション
        with gr.Row():
            df = gr.File(label="【D901】家屋単位GISデータ【CSV】")
            models = gr.File(label="学習済モデルの格納されたzipファイル")
        
        with gr.Row():
            threshold = gr.Slider(0.1, 0.9, step=0.1, value=DEFAULT_THRESHOLD, label="閾値", interactive=True)
        
        # メッセージ表示と結果ファイルダウンロードセクション
        with gr.Row():
            text = gr.Textbox(label="メッセージ", interactive=False)
            output_file = gr.File(label="【D902】空き家判定結果データ【CSV】")

        # 実行ボタン
        with gr.Row():
            match_button = gr.Button("submit")
        
        # ボタンのクリックアクション
        match_button.click(
            fn=on_submit,
            inputs=[
                citycode,
                targetyear,
                threshold
            ],
            outputs=[
                text,
                output_file
            ]
        )

    # インターフェースを起動
    iface.launch()

