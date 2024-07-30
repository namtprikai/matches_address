"""
# E012 名寄せ機能
* アップロードされた住所カラムに該当するすべての列の名寄せ（住所の正規化）をする機能
"""

import os
import re
import unicodedata
import chardet
import pandas as pd

class DataProcessor:
    def __init__(self, input_paths, output_paths):
        # 入力ファイルのパスを設定
        self.INPUT_PATHS = input_paths
        # 出力ファイルのパスを設定
        self.OUTPUT_PATHS = output_paths

    # 入力する各データのカラムを定義
    COLUMNS = {
        "suido_status": {
            "suido_number": "水道番号",
            "usage_status": "開閉栓区分",
            "suido_status_address": "設置場所",
            "usage_start_date": "使用開始日",
            "usage_end_date": "使用中止日"
        },
        "juki": {
            "setai_code": "世帯コード",
            "juki_address": "住所",
            "birth": "生年月日",
            "gender": "性別",
            "move_date":"住定異動年月日"
        },
        "touki": {
            "touki_address": "住所",
            "structure": "登記構造",
            "registration_date": "登記日付"
        },
        "akiya_result": {
            "akiya_result_ID": "ID",
            "akiya_result_address": "住所",
            "akiya_result_lat": "経度",
            "akiya_result_lon": "緯度"
        },
        "geocoding": {
            "geocoding_address": "住所",
            "geocoding_lat": "lat",
            "geocofing_lon": "lon"
        }
    }

    #　出力する各データのカラムを定義
    OUTPUT_COLUMNS = {
        "suido_status": {
            "suido_number": "水道番号",
            "usage_status": "開閉栓区分",
            "suido_address": "設置場所",
            "usage_start_date": "使用開始日",
            "usage_end_date": "使用中止日",
            "convert_suido_address": "正規化住所"
        },
        "juki": {
            "setai_code": "世帯コード",
            "juki_address": "住所",
            "birth": "生年月日",
            "gender": "性別",
            "move_date":"住定異動年月日",
            "convert_juki_address": "正規化住所"
        },
        "touki": {
            "touki_address": "住所",
            "structure": "登記構造",
            "registration_date": "登記日付",
            "convert_touki_address": "正規化住所"
        },
        "akiya_result": {
            "akiya_result_ID": "ID",
            "akiya_result__address": "住所",
            "akiya_result_lat": "経度",
            "akiya_result_lon": "緯度",
            "convert_akiya_address": "正規化住所"
        },
        "geocoding": {
            "geocoding_address": "住所",
            "geocoding_lat": "lat",
            "geocoding_lon": "lon",
            "convert_geo_address": "正規化住所"
        }
    }

    @staticmethod
    def detect_encoding(file_path):
        with open(file_path, 'rb') as file:
            raw_data = file.read()
        return chardet.detect(raw_data)['encoding']

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

# データのクリーンアップ用のクラス
class CleanData:
    # 単独カタカナの置換
    @staticmethod
    def replace_single_katakana(text):
        single_no_pattern = r'(?<![ｦ-ﾟ])ﾉ(?![ｦ-ﾟ])|(?<![ァ-ン])ノ(?![ァ-ン])'
        single_ke_pattern = r'(?<![ｦ-ﾟ])ｹ(?![ｦ-ﾟ])|(?<![ァ-ン])ケ(?![ァ-ン])'
        single_tsu_pattern = r'(?<![ｦ-ﾟ])ﾂ(?![ｦ-ﾟ])|(?<![ァ-ン])ツ(?![ァ-ン])'
        if isinstance(text, str):
            text = re.sub(single_no_pattern, "の", text)
            text = re.sub(single_ke_pattern, "が", text)
            text = re.sub(single_tsu_pattern, "つ", text)
        return text

    # 住所のフォーマットを変換。丁目、番地のハイフンに変換。
    @staticmethod
    def convert_address(address):
        if isinstance(address, str):
            address = re.sub(r"(\d+)丁目", r"\1-", address)
            address = re.sub(r"(\d+)番地(\d+号?)", r"\1-\2", address)
            address = re.sub(r"(\d+)番地$", r"\1", address)
            address = re.sub(r'-$', '', address)
        return address

    # テキストの正規化
    @staticmethod
    def normalize_text(text):
        if isinstance(text, str):
            return unicodedata.normalize("NFKC", text)
        return text

    # 半角カタカナを全角カタカナに変換
    @staticmethod
    def convert_halfwidth_to_fullwidth(text):
        half_to_full_katakana_map = str.maketrans(
            "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ",
            "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜"
        )
        if pd.isna(text):
            return text
        text = text.translate(half_to_full_katakana_map)
        text = re.sub(r'(\w゛)', lambda x: chr(ord(x.group(1)[0]) + 1), text)
        text = re.sub(r'(\w゜)', lambda x: chr(ord(x.group(1)[0]) + 2), text)
        return text

# 各ファイルごとの処理クラス
class EachFileProcessor(DataProcessor):
    def process_file(self, file_key):
        df = self.read_csv(self.INPUT_PATHS[file_key])
        if df is None:
            return
        
        cols = self.COLUMNS[file_key]
        df = df.dropna(subset=cols[f"{file_key}_address"])
        
        df["正規化住所"] = df[cols[f"{file_key}_address"]].apply(CleanData.convert_address)
        df["正規化住所"] = df["正規化住所"].apply(CleanData.replace_single_katakana)
        df['正規化住所'] = df['正規化住所'].apply(CleanData.convert_halfwidth_to_fullwidth)
        
        self.save_csv(df, self.OUTPUT_PATHS[file_key])

    def process_suido_status(self):
        self.process_file("suido_status")
        
    def process_juki(self):
        self.process_file("juki")
        
    def process_touki(self):
        self.process_file("touki")
        
    def process_akiya_result(self):
        self.process_file("akiya_result")
        
    def process_geocoding(self):
        self.process_file("geocoding")

def process_data(input_paths, output_paths):
    processor = EachFileProcessor(input_paths, output_paths)
    
    print("Process Suido Status Data...")
    processor.process_suido_status()

    print("Process Juki Data...")
    processor.process_juki()

    print("Process Touki Data...")
    processor.process_touki()
    
    print("Process Akiya Result Data...")
    processor.process_akiya_result()
    
    print("Process Geocoding Data...")
    processor.process_geocoding()

    print("All process completed!")
    
    return [
        output_paths["suido_status"],
        output_paths["juki"],
        output_paths["touki"],
        output_paths["akiya_result"],
        output_paths["geocoding"]
        ]

if __name__ == "__main__":
    # 入力ファイルのパスを設定
    input_paths = {
        "suido_status": "path/to/suido_status.csv",
        "juki": "path/to/juki.csv",
        "touki": "path/to/touki.csv",
        "akiya_result": "path/to/akiya_result.csv",
        "geocoding": "path/to/geocoding.csv"
    }
    
    # 出力ファイルのパスを設定
    output_paths = {
        "suido_status": "suido_status_cleaned.csv",
        "juki": "juki_cleaned.csv",
        "touki": "touki_cleaned.csv",
        "akiya_result": "akiya_result_cleaned.csv",
        "geocoding": "geocoding_cleaned.csv"
    }
    
    # データ処理を実行
    processed_files = process_data(input_paths, output_paths)
    
    print("Processed files:")
    for file_path in processed_files:
        print(file_path)