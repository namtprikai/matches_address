"""
# E013 住居単位データ作成機能
* 水道使用量（水道栓単位）、住民基本台帳（個人単位）等のデータを住居単位のデータへ再集計する機能
"""

import os
import sys
from datetime import datetime
import gradio as gr
import pandas as pd
from dateutil.relativedelta import relativedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from E001_DataMatching.E013 import *


# すべてのデータを処理する関数を作成
def process_all_data_gradio(suido_use_file, suido_status_file, juki_file, tatemono_file, base_date, search_period, citycode_value, targetyear_value):
    """
    すべてのデータファイルを処理する
    """
    # 各ファイルはアップロードされた内容を直接使う
    input_paths = {
        "suido_use": suido_use_file.name,
        "suido_status": suido_status_file.name,
        "juki": juki_file.name,
        "tatemono": tatemono_file.name
    }

    output_paths = {
        "suido": f"{citycode_value}/E013/outputs/suido_residence_{targetyear_value}.csv",
        "juki": f"{citycode_value}/E013/outputs/juki_residence_{targetyear_value}.csv",
        "tatemono": f"{citycode_value}/E013/outputs/touki_residence.csv"
    }

    processors = {
        "suido": SuidoProcessor,
        "juki": JukiProcessor,
        "tatemono": TatemonoProcessor
    }

    for file_key, processor_class in processors.items():
        print(f"{file_key}データを処理中...")
        processor_class(input_paths, output_paths, base_date, search_period).process()

        output_file = output_paths[file_key]
        if os.path.exists(output_file):
            print(f"{output_file} が生成されました。")
        else:
            print(f"エラー: {output_file} が生成されていません。")

    print("すべての処理が完了しました!")
    
    return [output_paths["suido"], output_paths["juki"], output_paths["tatemono"]]


if __name__ == "__main__":
    # Gradioのインターフェースを作成
    with gr.Blocks() as iface:
        gr.Markdown("# E013 - 住居単位データ作成機能")
        gr.Markdown("水道栓、水道使用量、住民基本台帳、登記簿・固定資産台帳を住居単位のデータへ集計する機能")

        with gr.Row():
            with gr.Column():
                citycode = gr.Dropdown(
                    label="市区町村コードを選択（23201:豊橋市、23211:豊田市）", 
                    choices=["23201", "23211"], 
                    value="23211", 
                    interactive=True
                )
                
                targetyear = gr.Dropdown(
                    label="対象年度を選択", 
                    choices=["2020", "2021", "2022", "2023", "2024"], 
                    value="2023", 
                    interactive=True
                )
        
        with gr.Row():
            # ファイルのアップロード (ドラッグアンドドロップ対応)
            suido_use_file = gr.File(label="Suido Use Data (水道使用量データ)")
            suido_status_file = gr.File(label="Suido Status Data (水道状況データ)")
            juki_file = gr.File(label="Juki Data (住民基本台帳データ)")
            tatemono_file = gr.File(label="Tatemono Data (登記簿データ)")

        with gr.Row():
            base_date = gr.Number(label="Base Date (YYYYMMDD)", value=20230320)
            search_period = gr.Number(label="Search Period (Year)", value=1)
        
        submit_button = gr.Button("処理を実行")

        with gr.Row():
            suido_output = gr.File(label="Processed Suido Data")
            juki_output = gr.File(label="Processed Juki Data")
            tatemono_output = gr.File(label="Processed Tatemono Data")

        # 実行処理
        def on_submit(suido_use_file, suido_status_file, juki_file, tatemono_file, citycode_value, targetyear_value, base_date, search_period):
            return process_all_data_gradio(suido_use_file, suido_status_file, juki_file, tatemono_file, base_date, search_period, citycode_value, targetyear_value)

        submit_button.click(
            fn=on_submit,
            inputs=[suido_use_file, suido_status_file, juki_file, tatemono_file, citycode, targetyear, base_date, search_period],
            outputs=[suido_output, juki_output, tatemono_output]
        )

    iface.launch()
