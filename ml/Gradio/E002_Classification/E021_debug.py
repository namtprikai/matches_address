"""
# E021 空き家学習機能
判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズムにてトレーニングモデルを作成し、分類精度を表示する機能。
""" 

import os
import pickle
import time
import warnings
import json
import sys
import chardet
import matplotlib.pyplot as plt
import japanize_matplotlib
import seaborn as sns
import numpy as np
import pandas as pd
import lightgbm as lgb
import optuna
import gradio as gr
import zipfile

from memory_profiler import profile
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score
from sklearn.model_selection import KFold, train_test_split

# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E021.pyからすべての関数をインポート
from E002_Classification.E021 import *

# Set pandas display options
pd.set_option('display.max_columns', None)

CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""



def generate_file_paths(citycode_value, targetyear_value):
    """
    市区町村コードと対象年度に基づいてファイルパスを生成する
    """
    path = f'../E001_DataMatching/data/{citycode_value}/E016/outputs/D901_{targetyear_value}.csv'
    return path

def gradio_interface(input_file,test_size, n_splits, undersample, undersample_ratio, threshold, hyperparameter_flag, n_trials, lambda_l1, lambda_l2, num_leaves, feature_fraction, bagging_fraction, bagging_freq, min_data_in_leaf, citycode_value, targetyear_value):
    """
    モデルを学習し評価する主要関数

    Parameters
    ----------
    input_file : gr.File
        入力CSVファイル
    test_size : float
        テストデータの割合
    n_splits : int
        交差検証の分割数
    undersample : bool
        アンダーサンプリングを使用するかどうか
    undersample_ratio : float
        アンダーサンプリングの比率
    threshold : float
        予測の閾値
    hyperparameter_flag : bool
        ハイパーパラメータチューニングを行うかどうか
    n_trials : int
        ハイパーパラメータチューニングの試行回数
    lambda_l1 : float
        L1正則化パラメータ
    lambda_l2 : float
        L2正則化パラメータ
    num_leaves : int
        木の葉の最大数
    feature_fraction : float
        特徴量のサブサンプリング比率
    bagging_fraction : float
        データのサブサンプリング比率
    bagging_freq : int
        バギングの頻度
    min_data_in_leaf : int
        葉ノードの最小データ数
    progress : gr.Progress
        進捗状況を表示するためのGradioのProgressオブジェクト

    Returns
    -------
    result_str : str
        評価結果の文字列
    feature_importance_plot : str
        特徴量重要度のプロット画像のファイルパス
    output_file : str
        出力CSVファイルのパス
    """
    # データ処理を実行
    explanatory_variables = [
        'gml_id', '世帯コード', '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', 
        '65歳以上人数', '15歳未満構成比', '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', 
        '住定期間', '水道番号_suido_residence', '水道使用量変化率_suido_residence', '最大使用水量_suido_residence', '平均使用水量_suido_residence', '閉栓フラグ_suido_residence', '構造名称_touki_residence', '登記日付_touki_residence', 'akiya_result_cleaned_flag'
    ]
    #result_str, feature_importances_file , output_file, model_zip_file_path, data_zip_file_path = train_and_evaluate(input_file, test_size, n_splits, undersample, undersample_ratio, threshold, hyperparameter_flag, n_trials, lambda_l1, lambda_l2, num_leaves, feature_fraction, bagging_fraction, bagging_freq, min_data_in_leaf, citycode_value, targetyear_value, job_id=333)
    result_str, feature_importances_file, output_file, model_zip_file_path, data_zip_file_path = train_and_evaluate(
        db_path="./",
        input_file=input_file,
        output_path="./",
        explanatory_variables=explanatory_variables,
        test_size=test_size,
        n_splits=n_splits,
        undersample=undersample,
        undersample_ratio=undersample_ratio,
        threshold=threshold,
        hyperparameter_flag=hyperparameter_flag,
        n_trials=n_trials,
        lambda_l1=lambda_l1,
        lambda_l2=lambda_l2,
        num_leaves=num_leaves,
        feature_fraction=feature_fraction,
        bagging_fraction=bagging_fraction,
        bagging_freq=bagging_freq,
        min_data_in_leaf=min_data_in_leaf,
        citycode_value=citycode_value,
        targetyear_value=targetyear_value,
        job_id=333
    )


    
    return result_str, feature_importances_file, output_file, model_zip_file_path, data_zip_file_path

if __name__ == "__main__":
    
    # Gradioインターフェースの設定
    with gr.Blocks(css=CUSTOM_CSS) as iface:
        gr.Markdown("E021 - 空き家学習機能")
        gr.Markdown("２つ以上の地理的な位置情報を持つ異なるインプットデータに対して、地理的な重なり関係から結合処理を行う機能。自治体保有データや都市計画情報などを用いて、空き家実績データに基づく建物ごとの空き家予測モデルを構築する機能")
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
                
        input_file_path = gr.File(label="【D901】家屋単位GISデータ（CSV）")        
        test_size = gr.Slider(0.1, 0.9, value=0.3, label="Test Size")
        n_splits = gr.Slider(2, 10, step=1, value=3, label="Number of Splits")
        undersample = gr.Checkbox(label="Use Undersampling")
        undersample_ratio = gr.Slider(1.0, 5.0, value=3.0, label="Undersample Ratio")
        threshold = gr.Slider(0.1, 0.9, value=0.3, label="Threshold")
        hyperparameter_flag = gr.Checkbox(label="Use Hyperparameter Tuning")
        n_trials = gr.Slider(10, 100, step=1, value=100, label="Number of Trials for Hyperparameter Tuning")
        lambda_l1 = gr.Slider(0, 1000, step=0.01, value=0, label="L1 Regularization")
        lambda_l2 = gr.Slider(0, 1000, step=0.01, value=0, label="L2 Regularization")
        num_leaves = gr.Slider(2, 256, step=1, value=31, label="Number of Leaves")
        feature_fraction = gr.Slider(0.5, 1.0, value=1.0, label="Feature Fraction")
        bagging_fraction = gr.Slider(0.5, 1.0, value=1.0, label="Bagging Fraction")
        bagging_freq = gr.Slider(0, 10, step=1, value=0, label="Bagging Frequency")
        min_data_in_leaf = gr.Slider(1, 50, step=1, value=20, label="Minimum Data in Leaf")
        
        match_button = gr.Button("submit")
        result_text = gr.Textbox(label="分析結果")
        feature = gr.Image(label="特徴量重要度")
        output_file = gr.File(label="【D902】空き家判定結果データ")
        output_models = gr.File(label="学習済みモデル")
        output_data = gr.File(label="各種データ")
        
        def on_submit(citycode_value, targetyear_value, test_size, n_splits, undersample, undersample_ratio, threshold, hyperparameter_flag, n_trials, lambda_l1, lambda_l2, num_leaves, feature_fraction, bagging_fraction, bagging_freq, min_data_in_leaf):
            # ファイルパスを生成
            input_file_path = generate_file_paths(citycode_value, targetyear_value)
            
            return gradio_interface(input_file_path
                                      , test_size
                                      , n_splits
                                      , undersample
                                      , undersample_ratio
                                      , threshold
                                      , hyperparameter_flag
                                      , n_trials
                                      , lambda_l1
                                      , lambda_l2
                                      , num_leaves
                                      , feature_fraction
                                      , bagging_fraction
                                      , bagging_freq
                                      , min_data_in_leaf
                                      , citycode_value
                                      , targetyear_value)
            
        match_button.click(
            fn=on_submit,
            inputs=[
                citycode,
                targetyear,
                test_size,
                n_splits,
                undersample,
                undersample_ratio,
                threshold,
                hyperparameter_flag,
                n_trials,
                lambda_l1,
                lambda_l2,
                num_leaves,
                feature_fraction,
                bagging_fraction,
                bagging_freq,
                min_data_in_leaf
            ],
            outputs=[
                result_text,
                feature,
                output_file,
                output_models,
                output_data
            ]
        )
    
    # Gradioインターフェースの起動
    iface.launch()
