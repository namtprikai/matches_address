"""
# E015 座標付与機能
* 座標（緯度，経度）形式で収録されていないデータに座標を付与する機能
"""

import io
import os
import time
from typing import List, Tuple
import sys
import requests
import gradio as gr
import pandas as pd

# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E015.pyからすべての関数をインポート
from E001_DataMatching.E015 import *


CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""
OUTPUT_PATH = "Accident_latlon.csv"

# ファイルの列名を取得
def get_column_names(file: io.BytesIO) -> List[str]:
    file_encoding = detect_encoding(file.name)
    df = pd.read_csv(file.name, encoding=file_encoding)
    return df.columns.tolist()

# ファイルの列名を取得、基準の列名選択に使用
def update_column(main_csv: io.BytesIO) -> gr.Dropdown:
    if main_csv is None:
        return gr.Dropdown.update(), gr.Dropdown.update()
    columns = get_column_names(main_csv)
    return gr.update(choices=columns)

with gr.Blocks(css=CUSTOM_CSS) as e015:
    file_input = gr.File(label="csvファイルを入力してください", elem_id="csv")
    api_key_input = gr.Textbox(label="AWS API Key", placeholder="Enter your AWS API Key")
    column_dropdown = gr.Dropdown(label="結合元の基準にする列を選択してください")
    match_button = gr.Button("緯度経度情報の追加を実行")
    output_file = gr.File(label="Matched Data CSV")
    
    file_input.change(
        update_column,
        inputs=[file_input],
        outputs=[column_dropdown]
    )
    
    match_button.click(
        add_latlon,
        inputs=[file_input, column_dropdown, api_key_input],
        outputs=[output_file]
    )

e015.launch()
