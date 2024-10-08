"""
# E015 座標付与機能
* 座標（緯度，経度）形式で収録されていないデータに座標を付与する機能
"""

import io
import os
import time
from typing import List, Tuple

import requests
import gradio as gr
import pandas as pd
import argparse




OUTPUT_PATH = "Accident_latlon.csv"

# AWS Location Serviceを使用して緯度経度情報を取得
def getAWSLocationLatLon(address: str, api_key: str) -> Tuple[float, float, str]:
    api_endpoint = f'https://places.geo.ap-northeast-1.amazonaws.com/places/v0/indexes/ProjectLINKS_Veda/search/text?key={api_key}'
    try:
        payload = {'Text': address}
        # API呼び出し
        response = requests.post(api_endpoint, json=payload)
        if response.status_code == 200:
            data = response.json()
            resPlace = data['Results'][0]['Place']
            lat = resPlace['Geometry']['Point'][1]
            lon = resPlace['Geometry']['Point'][0]
            types = resPlace.get('Label', 'Unknown')
            return lat, lon, types
        else:
            print(f"エラー: {response.status_code}, {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    return 0, 0, "fail"

# 緯度経度情報の追加
def add_latlon(file: io.BytesIO, target_column: str) -> str:
    file_encoding = detect_encoding(file.name)
    df = pd.read_csv(file.name, encoding=file_encoding)
    # 各セル内の改行を削除する
    df = df.applymap(lambda x: x.replace('\n', '').replace('\r', '') if isinstance(x, str) else x)
    output = []

    for i, row in df.iterrows():
        address = row[target_column]
        try:
            lat, lon, types = getAWSLocationLatLon(address, api_key=AWS_API_KEY)
        except:
            print("error: {}".format(address))
            lat = 0
            lon = 0
            types = "fail"
        row["lat"] = lat
        row["lon"] = lon
        row["types"] = types
        output.append(row)
        time.sleep(0.01)

    df_output = pd.DataFrame(output)
    df_output.to_csv(OUTPUT_PATH, index=False, encoding="cp932")
    return OUTPUT_PATH

# encodingを検知
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



# Main function to handle command-line arguments and execution
def main():
    parser = argparse.ArgumentParser(description="Add latitude and longitude to a CSV using AWS Location Service.")
    parser.add_argument('--file', required=True, help="Path to the input CSV file")
    parser.add_argument('--column', required=True, help="The column in the CSV that contains the addresses")
    parser.add_argument('--api_key', required=True, help="Your AWS Location Service API Key")
    parser.add_argument('--output', default="Accident_latlon.csv", help="Path to save the output CSV file (default: Accident_latlon.csv)")

    args = parser.parse_args()

    add_latlon(args.file, args.column, args.api_key, args.output)

if __name__ == "__main__":
    main()
