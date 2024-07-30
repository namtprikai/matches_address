"""
# E013 住居単位データ作成機能
* 水道使用量（水道栓単位）、住民基本台帳（個人単位）等のデータを住居単位のデータへ再集計する機能
"""

import os
import tempfile
from datetime import datetime

import gradio as gr
import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
from sklearn.preprocessing import LabelEncoder

class DataProcessor:
    def __init__(self, input_paths, output_paths, base_date, search_period):
        # 入力ファイルのパスを設定
        self.INPUT_PATHS = input_paths
        # 出力ファイルのパスを設定
        self.OUTPUT_PATHS = output_paths
        # 空き家予測の基準日
        self.BASE_DATE = datetime.strptime(str(base_date), "%Y%m%d")
        # 検索期間
        self.SEARCH_PERIOD = search_period

    # 各データで利用するカラムを定義
    COLUMNS = {
        "suido_use": {
            "suido_number": "水道番号",
            "meter_reading_date": "検針年月日",
            "suido_usage": "使用水量"
        },
        "suido_status": {
            "suido_number": "水道番号",
            "usage_status": "開閉栓区分",
            "suido_address": "正規化住所",
            "usage_start_date": "使用開始日",
            "usage_end_date": "使用中止日"
        },
        "juki": {
            "setai_code": "世帯コード",
            "juki_address": "正規化住所",
            "birth": "生年月日",
            "sex": "性別",
            "move_date": "住定異動年月日"
        },
        "tatemono": {
            "tatemono_address": "正規化住所",
            "structure": "登記構造",
            "registration_date": "登記日付"
        }
    }

    # データごとの出力するカラムを定義
    OUTPUT_COLUMNS = {
        "suido": [
            "水道番号", "正規化住所", "閉栓フラグ", 
            "最大使用水量", "平均使用水量", "最小使用水量", "合計使用水量"
        ],
        "juki": [
            "世帯コード", "正規化住所", "世帯人数",
            "15歳未満人数", "15歳未満構成比",
            "15歳以上64歳以下人数", "15歳以上64歳以下構成比",
            "65歳以上人数", "65歳以上構成比",
            "男女比", "住定期間"
        ],
        "tatemono": ["正規化住所", "構造名称", "登記日付"]
    }

    @staticmethod
    def read_csv(path, **kwargs):
        try:
            detected_encoding = DataProcessor.detect_encoding(path)
            if detected_encoding.lower() in ['cp932', 'shift_jis', 'utf-8']:
                encoding = detected_encoding
            else:
                encoding = 'shift_jis'  # Default to shift_jis if not one of the specified encodings
            return pd.read_csv(path, encoding=encoding, **kwargs)
        except Exception as e:
            print(f"Error reading file {path}: {e}")
            return None

    @staticmethod
    def save_csv(df, path):
        try:
            df.to_csv(path, encoding='shift_jis', index=False)
            print(f"File saved successfully: {path}")
        except Exception as e:
            print(f"Error saving file {path} with shift-jis encoding: {e}")
            try:
                df.to_csv(path, encoding='cp932', index=False)
                print(f"File saved successfully with cp932 encoding: {path}")
            except Exception as e:
                print(f"Error saving file {path} with cp932 encoding: {e}")

    @staticmethod
    def drop_duplicates(df, subset, keep="first"):
        return df.drop_duplicates(subset=subset, keep=keep)

    def process(self):
        raise NotImplementedError("Subclasses must implement this method")

# 水道関連データの住戸単位の集計
class SuidoProcessor(DataProcessor):
    def preprocess_suido_use(self, df):
        cols = self.COLUMNS["suido_use"]
        # datetimeに変換
        df[cols["meter_reading_date"]] = pd.to_datetime(df[cols["meter_reading_date"]], format="%Y%m%d")
        
        # ユーザーが選択した期間のデータを抽出
        df = df[(df[cols["meter_reading_date"]] >= (self.BASE_DATE - relativedelta(years=self.SEARCH_PERIOD) - relativedelta(days=1))) & 
                (df[cols["meter_reading_date"]] <= self.BASE_DATE)]
        
        # 検針年月を作成
        df["検針年月"] = df[cols["meter_reading_date"]].dt.strftime("%Y-%m")
        
        # 同一水道番号・同一月のデータを合計
        df_cleaned = df.groupby([cols["suido_number"], "検針年月"])[cols["suido_usage"]].sum().reset_index()
        
        return df_cleaned

    # ピボットテーブルを作成
    def pivot_table(self, df):
        cols = self.COLUMNS["suido_use"]
        df_suido_use_pt = df.pivot_table(index=cols["suido_number"], columns="検針年月", values=cols["suido_usage"], aggfunc='sum').reset_index()
        return df_suido_use_pt

    # 基準日からさかのぼって指定期間の水道使用量のみを抽出
    def preprocess_suido_data(self, df):
        cols = self.COLUMNS["suido_use"]
        start_date = self.BASE_DATE - relativedelta(years=self.SEARCH_PERIOD)
        date_range = pd.date_range(start=start_date, end=self.BASE_DATE, freq='MS')
        date_columns = [d.strftime("%Y-%m") for d in date_range]
        
        for col in date_columns:
            if col not in df.columns:
                df[col] = np.nan
        
        df = df[[cols["suido_number"]] + date_columns]
        return df

    # 各種統計量を計算
    def calculate_suido_stats(self, df):
        cols = self.COLUMNS["suido_use"]
        date_columns = [col for col in df.columns if col != cols["suido_number"]]
        df["最大使用水量"] = df[date_columns].max(axis=1)
        df["平均使用水量"] = df[date_columns].mean(axis=1)
        df["最小使用水量"] = df[date_columns].min(axis=1)
        df["合計使用水量"] = df[date_columns].sum(axis=1)
        return df[[cols["suido_number"], "最大使用水量", "平均使用水量", "最小使用水量", "合計使用水量"]]

    # 閉栓フラグを付与
    def value_operation_flg(self, df):
        cols = self.COLUMNS["suido_status"]
        df["閉栓フラグ"] = df[cols["usage_end_date"]].notnull()
        return df

    # 水道データの住戸単位の集計処理および住戸単位の使用量、利用実態を抽出
    def process(self):
        # データの読み込み
        df_suido_use = self.read_csv(self.INPUT_PATHS["suido_use"])
        df_suido_status = self.read_csv(self.INPUT_PATHS["suido_status"], encoding="cp932")

        if df_suido_use is None or df_suido_status is None:
            return
        
        # 住戸単位にする
        df_suido_use_cleaned = self.preprocess_suido_use(df_suido_use)
        df_suido_use_pt = self.pivot_table(df_suido_use_cleaned)
        # 基準日からさかのぼって指定期間の水道使用量のみを抽出
        df_suido_use_processed = self.preprocess_suido_data(df_suido_use_pt)
        # 水道使用量の統計量を計算
        df_suido_stats = self.calculate_suido_stats(df_suido_use_processed)
        # 閉栓フラグを付与
        df_suido_operation = self.value_operation_flg(df_suido_status)

        cols_status = self.COLUMNS["suido_status"]
        df_suido = pd.merge(df_suido_operation[[cols_status["suido_number"], cols_status["suido_address"], "閉栓フラグ"]], 
                            df_suido_stats, on=cols_status["suido_number"], how="inner")
        
        df_suido = self.drop_duplicates(df_suido.sort_values(by="最大使用水量", ascending=False), 
                                        subset=cols_status["suido_address"])

        df_suido = df_suido[self.OUTPUT_COLUMNS["suido"]]

        # 出力
        self.save_csv(df_suido, self.OUTPUT_PATHS["suido"])

# 住基データの世帯単位の集計
class JukiProcessor(DataProcessor):
    # 各世帯の年齢送別人数を計算
    def calculate_age_groups(self, df):
        cols = self.COLUMNS["juki"]
        df[cols["birth"]] = pd.to_datetime(df[cols["birth"]])
        df["年齢"] = (self.BASE_DATE - df[cols["birth"]]).dt.days // 365

        age_groups = {
            "15歳未満": df["年齢"] < 15,
            "15歳以上64歳以下": (df["年齢"] >= 15) & (df["年齢"] <= 64),
            "65歳以上": df["年齢"] >= 65
        }

        for group, condition in age_groups.items():
            df[group] = condition.astype(int)

        return df

    # 各世帯の年齢別人数の構成比を計算
    def calculate_age_stats(self, df):
        cols = self.COLUMNS["juki"]
        group_cols = [cols["setai_code"], cols["juki_address"]]
        age_stats = {}

        total_households = df.groupby(group_cols).size().reset_index(name="total_households")

        for group in ["15歳未満", "15歳以上64歳以下", "65歳以上"]:
            stats = df.groupby(group_cols)[group].sum().reset_index(name=f"{group}人数")
            stats = stats.merge(total_households, on=group_cols)
            stats[f"{group}構成比"] = stats[f"{group}人数"] / stats["total_households"]
            stats.drop(columns="total_households", inplace=True)
            age_stats[group] = stats
        
        df_age_stats = age_stats.pop("15歳未満")
        for group, stats in age_stats.items():
            df_age_stats = df_age_stats.merge(stats, on=group_cols, how="inner")

        return df_age_stats

    # 男女比を計算
    def calculate_gender_ratio(self, df):
        cols = self.COLUMNS["juki"]
        gender_counts = df.groupby([cols["setai_code"], cols["juki_address"], cols["sex"]]).size().unstack(fill_value=0)
        gender_counts["男女比"] = gender_counts[2] / gender_counts[1]
        return gender_counts.reset_index()

    # 住定期間を計算
    def calculate_residence_duration(self, df):
        cols = self.COLUMNS["juki"]
        df[cols["move_date"]] = pd.to_datetime(df[cols["move_date"]])
        df["住定期間"] = (self.BASE_DATE - df[cols["move_date"]]).dt.days
        return df.groupby([cols["setai_code"], cols["juki_address"]])["住定期間"].max().reset_index()

    def process(self):
        # データの読み込み
        df_juki = self.read_csv(self.INPUT_PATHS["juki"], encoding="cp932")
        if df_juki is None:
            return

        # 世帯単位にする
        df_juki = self.calculate_age_groups(df_juki)

        cols = self.COLUMNS["juki"]
        df_setai_count = df_juki.groupby([cols["setai_code"], cols["juki_address"]]).size().reset_index(name="世帯人数")
        # 各世帯の年齢別人数,構成比，男女比を計算
        df_age_stats = self.calculate_age_stats(df_juki)
        df_gender_ratio = self.calculate_gender_ratio(df_juki)
        df_residence_duration = self.calculate_residence_duration(df_juki)

        df_juki_processed = pd.merge(df_setai_count, df_age_stats, on=[cols["setai_code"], cols["juki_address"]], how="inner")
        df_juki_processed = pd.merge(df_juki_processed, df_gender_ratio[[cols["setai_code"], cols["juki_address"], "男女比"]], on=[cols["setai_code"], cols["juki_address"]], how="inner")
        df_juki_processed = pd.merge(df_juki_processed, df_residence_duration, on=[cols["setai_code"], cols["juki_address"]], how="inner")

        df_juki_processed = self.drop_duplicates(df_juki_processed, subset=cols["juki_address"], keep=False)

        df_juki_processed = df_juki_processed[self.OUTPUT_COLUMNS["juki"]]

        # 出力
        self.save_csv(df_juki_processed, self.OUTPUT_PATHS["juki"])

# 固定資産課税台帳、登記簿データの住所単位の集計
class TatemonoProcessor(DataProcessor):
    # 構造を分類(E012で処理するため、ラベルエンコーディングのみ行う可能性あり)
    def classify_structure(self, df):
        cols = self.COLUMNS["tatemono"]
        structure_dict = {
            "木造": ["木造"],
            "RC造": ["RC造", "鉄筋コンクリート造"],
            "S造": ["S造", "鉄骨造"],
            "SRC造": ["SRC造", "鉄骨鉄筋コンクリート造"]
        }

        df["構造名称"] = "その他"
        for key, values in structure_dict.items():
            pattern = "|".join(values)
            df.loc[df[cols["structure"]].str.contains(pattern, na=False), "構造名称"] = key

        label_encoder = LabelEncoder()
        df["構造名称"] = label_encoder.fit_transform(df["構造名称"])

        return df

    def process(self):
        df_tatemono = self.read_csv(self.INPUT_PATHS["tatemono"], encoding="cp932")
        if df_tatemono is None:
            return

        # 構造を分類し、ラベルエンコーディング
        df_tatemono = self.classify_structure(df_tatemono)
        cols = self.COLUMNS["tatemono"]
        
        # 重複データを削除
        df_tatemono = self.drop_duplicates(df_tatemono, subset=cols["tatemono_address"], keep=False)
        
        df_tatemono = df_tatemono[self.OUTPUT_COLUMNS["tatemono"]]

        # 出力
        self.save_csv(df_tatemono, self.OUTPUT_PATHS["tatemono"])

# すべてのデータを処理する関数を作成
def process_all_data(suido_use_file, suido_status_file, juki_file, tatemono_file, base_date, search_period):
    
    # 入力ファイルのパスを設定
    input_paths = {
        "suido_use": suido_use_file.name,
        "suido_status": suido_status_file.name,
        "juki": juki_file.name,
        "tatemono": tatemono_file.name
    }
        
    # 出力ファイルのパスを設定
    output_paths = {
        "suido": "suido_residence.csv",
        "juki": "juki_residence.csv",
        "tatemono": "touki_residence.csv"
    }

    print("Processing Suido data...")
    SuidoProcessor(input_paths, output_paths, base_date, search_period).process()

    print("Processing Juki data...")
    JukiProcessor(input_paths, output_paths, base_date, search_period).process()
    
    print("Processing Tatemono data...")
    TatemonoProcessor(input_paths, output_paths, base_date, search_period).process()

    print("All processes completed.")
    
    return [output_paths["suido"], output_paths["juki"], output_paths["tatemono"]]

if __name__ == "__main__":
    # Gradioのインターフェースを作成
    iface = gr.Interface(
        fn=process_all_data,
        inputs=[
            gr.File(label="Suido Use Data"),
            gr.File(label="Suido Status Data"),
            gr.File(label="Juki Data"),
            gr.File(label="Tatemono Data"),
            gr.Number(label="Base Date (YYYYMMDD)"),
            gr.Number(label="Search Period (Year)")
        ],
        outputs=[
            gr.File(label="Processed Suido Data"),
            gr.File(label="Processed Juki Data"),
            gr.File(label="Processes Tatemono Data")
        ],
        title="E013 - 住居単位データ作成機能",
        description="水道栓、水道使用量、住民基本台帳、登記簿・固定資産台帳を住居単位のデータへ集計する機能"
    )
    
    iface.launch()