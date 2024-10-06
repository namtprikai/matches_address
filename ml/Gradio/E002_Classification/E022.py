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

def main():
    REQUIRED_FEATURES = [
        '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', '65歳以上人数', '15歳未満構成比',
        '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', '住定期間', '最大使用水量_suido_residence',
        '閉栓フラグ_suido_residence', '構造名称_touki_residence', '登記日付_touki_residence'
    ]
    OUTCOME_VARIABLE = 'akiya_result_cleaned_flag'
    DEFAULT_THRESHOLD = 0.3
    OUTPUT_FILE = 'D902.csv'

    # Gradioインターフェースの設定
    iface = gr.Interface(
        fn=lambda input_file, model_zip, threshold: process_and_predict(
            os.path.dirname(input_file.name),
            os.path.basename(input_file.name),
            model_zip,
            threshold,
            OUTPUT_FILE,
            REQUIRED_FEATURES,
            OUTCOME_VARIABLE
        ),
        inputs=[
            gr.File(label="【D901】家屋単位GISデータ【CSV】"),
            gr.File(label="学習済モデルの格納されたzipファイル"),
            gr.Slider(0.1, 0.9, step=0.1, value=DEFAULT_THRESHOLD, label="閾値"),
        ],
        outputs=[
            gr.Textbox(label="メッセージ"),
            gr.File(label="【D902】空き家判定結果データ【CSV】"),
        ],
        title="E022 - 空き家分類機能",
        description="判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズム（トレーニング済み）を実行する機能"
    )

    # Gradioインターフェースの起動
    iface.launch()

if __name__ == "__main__":
    main()
