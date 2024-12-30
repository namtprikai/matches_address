"""
# E016 空間結合機能
* ２つ以上の地理的な位置情報を持つ異なるインプットデータに対して、地理的な重なり関係から結合処理を行う機能。

* インプットデータに対して緯度経度、地番住所、住居表示等を用いたジオコーディング処理（住所や地名から緯度経度といった地理座標を付与すること）を行い、これらを空間結合する機能.
* 空間結合ではポリゴンデータとポイントデータにおける結合を対象とし、交差結合を基本とする。位置精度によるずれを防ぐため、最近傍結合も考慮するものとする。
* 住居IDを付与する。住居IDは戸建と共同住宅の部屋を対象に付与される。IDの生成方法は空間結合先である空き家基盤データの建築物IDを基準とし、建築物IDに4桁からなるランダムな16進数の文字列をハイフンを入れて付与する。
* 結合処理後、空間結合の結合率を算出する。結合率は水道のポイントデータ件数を分母とし、そのポイントで建物データに結合されたものを分子として計算を行う。 

# 現在のスコープ
* plateuの建物データに水道利用量データ（ポイント）を空間結合する。（最近傍処理）
* 結合割合計算（水道データ）
"""

import math
import os
import random
import string
import sys
import chardet
import geopandas as gpd
import gradio as gr
import numpy as np
import pandas as pd
from pyproj import Transformer
from shapely import wkt, wkb
from shapely.geometry import MultiPolygon, Point, Polygon

# ./srcをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

# E016.pyからすべての関数をインポート
from E001_DataMatching.E016 import *

pd.set_option("display.max_columns", None)

# 水道データ結合の際の、オプション。0；交差結合、1:最近傍結合
option = 0
# カスタムCSS
CUSTOM_CSS = """
#csv label {
    font-size: 20px;
    font-weight: bold;
    color: lightblue;
}
"""
# 各データで利用するカラムを定義
COLUMNS = {
        "tatemono": {
            'gml_id':"id",
            'class':"区分",
            'measuredHeight':"計測高さ",
            'measuredHeight_uom':"計測高さ計測単位",
            'srcScale':"地図情報レベル",
            'geometrySrcDesc':"幾何属性作成⽅法",
            'thematicSrcDesc':"主題属性作成⽅法",
            'lod1HeightType':"建築物の⾼さの算出⽅法",
            'buildingID':"建築物に付与される固有の識別",
            'prefecture':"⼟地が所在する都道府県の都道府県コ−ド",
            'city':"⼟地が所在する市区町村の市区町村コ−ド",
            'description':"概要",
            'rank':"浸水ランク",
            'depth':"浸水深",
            'depth_uom':"浸水深の単位",
            'adminType':"浸水リスク指定機関区分",
            'scale':"浸水規模",
            'duration':"継続時間",
            'duration_uom':"継続時間単位",
            '建築確認申請の用途':"建築確認申請の用途",
            '地上階数':"地上階数",
            '地下階数':"地下階数",
            'value':"拡張属性",
            'value_uom':"拡張属性の単位",
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|description':"内水浸水リスク説明",
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|rank':"内水浸水リスクランク",
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth':"内水浸水深",
            'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth_uom':"内水浸水深の単位",  
            'name':"名称",
            'areaType':"土砂災害リスク区域区分",
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|description':"洪水浸水リスク説明",
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|rank':"洪水浸水リスクランク",
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth':"洪水浸水深",
            'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth_uom':"洪水浸水深の単位",
            'buildingDisasterRiskAttribute|BuildingLandSlideRiskAttribute|description':"洪水浸水リスク説明",
            '大規模店舗名称':"大規模店舗名称", 
            'appearanceSrcDesc':"テクスチャ作成⽅法",
            'branchID':"建物ID 枝番", 
            'geometry':"建物ポリゴン情報"
        },
        "water_supply": {
            'count':"人数", 
            'count_age_under_15':"15歳以下人数", 
            'count_age_under_15_ratio':"15歳以下割合",
            'count_age_15_to_64':"15ー64歳人数",
            'count_age_15_to_64_ratio':"15ー64歳割合",
            'count_age_over_65':"65歳以上人数",
            'count_age_over_65_ratio':"65歳以上割合",
            'count_male':"男性人数",
            'male_ratio':"男性割合", 
            'count_female':"女性人数",
            'female_ratio':"女性割合", 
            'residence_duration':"居住期間",
            '開閉栓区分':"開閉栓区分", 
            'max_suido_use':"最大使用量",
            'target':"ターゲット数",
            'geometry':"位置情報"
        },
    }

# データごとの出力するカラムを定義
OUTPUT_COLUMNS = {
    "tatemono": ['count', 'count_age_under_15', 'count_age_under_15_ratio',
                 'count_age_15_to_64', 'count_age_15_to_64_ratio', 'count_age_over_65',
                 'count_age_over_65_ratio', 'count_male', 'male_ratio', 'count_female',
                 'female_ratio', 'residence_duration', '開閉栓区分', 'max_suido_use',
                 'target', 'gml_id_left', 'class', 'measuredHeight',
                 'measuredHeight_uom', 'srcScale', 'geometrySrcDesc', 'thematicSrcDesc',
                 'lod1HeightType', 'buildingID', 'prefecture_left', 'city_left',
                 'description', 'rank', 'depth', 'depth_uom', 'adminType', 'scale',
                 'duration', 'duration_uom', '建築確認申請の用途', '地上階数', '地下階数', 'value',
                 'value_uom',
                 'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|description',
                 'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|rank',
                 'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth',
                 'buildingDisasterRiskAttribute|BuildingInlandFloodingRiskAttribute|depth_uom',
                 'name', 'areaType',
                 'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|description',
                 'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|rank',
                 'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth',
                 'buildingDisasterRiskAttribute|BuildingRiverFloodingRiskAttribute|depth_uom',
                 'buildingDisasterRiskAttribute|BuildingLandSlideRiskAttribute|description',
                 '大規模店舗名称', 'appearanceSrcDesc', 'branchID', 'geometry'
                 ],
    "merged_ratio": ["結合割合"]
    }

WGS84 = 6668

PREF_TO_COORD_NUMBER = {
    "長崎県": 1,
    "福岡県": 2, "佐賀県": 2, "熊本県": 2, "大分県": 2, "宮崎県": 2,
    "山口県": 3, "島根県": 3, "広島県": 3,
    "香川県": 4, "愛媛県": 4, "徳島県": 4, "高知県": 4,
    "兵庫県": 5, "鳥取県": 5, "岡山県": 5,
    "京都府": 6, "大阪府": 6, "福井県": 6, "滋賀県": 6, "三重県": 6, "奈良県": 6, "和歌山県": 6,
    "石川県": 7, "富山県": 7, "岐阜県": 7, "愛知県": 7,
    "新潟県": 8, "長野県": 8, "山梨県": 8, "静岡県": 8,
    "福島県": 9, "栃木県": 9, "茨城県": 9, "埼玉県": 9, "千葉県": 9, "群馬県": 9, "神奈川県": 9,
    "青森県": 10, "秋田県": 10, "山形県": 10, "岩手県": 10, "宮城県": 10,
}

NUMBER_1_CITIES = {
    "十島村", "喜界町", "奄美市", "龍郷町", "大和村", "宇検村", "瀬戸内町","三島村","里村","上甑村","下甑村","鹿島村"
    "天城町", "徳之島町", "伊仙町", "和泊町", "知名町", "与論町","名瀬市","住用村","笠利町"
}

NUMBER_11_CITIES = {
    "小樽市", "函館市", "伊達市", "北斗市","大滝村","上磯町","大野町","郡戸井町","恵山町","椴法華村","南茅部町",
    "島牧村", "寿都町", "黒松内町", "蘭越町", "ニセコ町", "真狩村", "留寿都村", "喜茂別町", "京極町", "俱知安町", "共和町", "岩内町","倶知安町",
    "泊村", "神恵内村", "積丹町", "古平町", "仁木町", "余市町", "赤井川村",
    "豊浦町", "壮瞥町", "洞爺湖町","虻田町","洞爺村",
    "松前町", "福島町", "知内町", "木古内町", "七飯町", "鹿部町", "森町", "八雲町", "長万部町","熊石町","砂原町",
    "江差町", "上ノ国町", "厚沢部町", "乙部町", "奥尻町", "今金町", "せたな町","大成町","瀬棚町","北檜山町"
}

NUMBER_13_CITIES = {
    "北見市", "帯広市", "釧路市", "網走市", "根室市","端野町","留辺蘂町","常呂町","阿寒町","音別町",
    "美幌町", "津別町", "斜里町", "清里町", "小6清水町", "訓子府町", "置戸町", "佐呂間町", "大空町","東藻琴村","女満別町", 
    "音更町", "士幌町", "上士幌町", "鹿追町", "新得町", "清水町", "芽室町", "中札内村", "更別村", "大樹町", "広尾町", "幕別町","忠類村",
    "池田町", "豊頃町", "本別町", "足寄町", "陸別町", "浦幌町",
    "釧路町", "厚岸町", "浜中町", "標茶町", "弟子屈町", "鶴居村", "白糠町",
    "別海町", "中標津町", "標津町", "羅臼町",
    "色丹村", "泊村", "留夜別村", "留別村", "紗那村", "蘂取村",
}

NUMBER_14_CITIES = {
    "小笠原村"
}

NUMBER_16_CITIES = {
    "宮古島市", "多良間村", "石垣市", "竹富町", "与那国町","平良市","城辺町","下地町","上野村","伊良部町"
}

NUMBER_17_CITIES = {
    "北大東村", "南大東村"
}

def generate_file_paths(citycode_value, targetyear_value):
    """
    市区町村コードと対象年度に基づいてファイルパスを生成する
    """
    
    e14_merged_file = f'./data/{citycode_value}/E014/outputs/matched_data.csv'
    #tatemono_file = f'./data/{citycode_value}/E016/inputs/toyota_lod0_attributes.csv'
    # citygml format
    #tatemono_file = f'./data/{citycode_value}/E016/inputs/PLATEAU_建物データ_citygml_豊田市_アプリ読込用.zip'
    tatemono_file = f'./data/{citycode_value}/E016/inputs/PLATEAU_建物データ_citygml_豊橋市_アプリ読込用.zip'
    shp_file = f'./data/{citycode_value}/E016/inputs/r2ka23.gpkg'
    output_path = f'./data/{citycode_value}/E016/outputs/D901_{targetyear_value}.csv'
    return tatemono_file, e14_merged_file, shp_file, output_path

def gradio_interface(tatemono_file, e14_merged_file, shp_file, ken, sikuchoson, join_option, output_format, output_path):
    """
    Gradioインターフェース用の関数。建物データと水道データを処理し、結果を出力する。

    Parameters
    ----------
    tatemono_file : File
        建物データのファイル
    e14_merged_file : File
        E14 outputのファイル
    ken : str
        県の名前
    sikuchoson : str
        市区町村の名前
    join_option : str
        結合オプション（"交差結合"または"最近傍結合"）
    output_format : str
        出力形式（'gpkg'または'csv'）

    Returns
    -------
    tuple
        出力ファイルのパスと結合率のメッセージ
    """
    # 結合オプションを設定（0: 交差結合、1: 最近傍結合）
    option = 0 if join_option == "交差結合" else 1
    # データ処理を実行
    output_path, join_ratio = process_data(tatemono_file, e14_merged_file, shp_file, ken, sikuchoson, option, output_format, output_path)
    # 結果を返す
    return output_path, f"結合率: {join_ratio}%"


if __name__ == "__main__":
    # Gradioインターフェースの設定
    with gr.Blocks(css=CUSTOM_CSS) as iface:
        gr.Markdown("E016 - 空間結合機能")
        gr.Markdown("２つ以上の地理的な位置情報を持つ異なるインプットデータに対して、地理的な重なり関係から結合処理を行う機能。")
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
        tatemono_file = gr.File(label="【D101、D102、D106】空き家基盤データ (CSV)")
        e14_merged_file = gr.File(label="【D401】テキストマッチングデータ (CSV)")
        shp_file = gr.File(label="国勢調査 小地域ポリゴンデータ")
        ken = gr.Textbox(label="都道府県", value="愛知県")
        sikuchoson = gr.Textbox(label="市区町村", value="豊田市")
        option = gr.Radio(["交差結合", "最近傍結合"], label="結合方式", value='最近傍結合')
        output_format = gr.Radio(["csv", "gpkg"], label="出力形式", value='csv')
        
        match_button = gr.Button("結合開始")
        output_file = gr.File(label="出力ファイル")
        results_text = gr.Textbox(label="結合率")

        def on_submit(citycode_value, targetyear_value, ken, sikuchoson, join_option, output_format):
            os.makedirs(f'./data/{citycode_value}/E016/outputs/', exist_ok=True)
            tatemono_file, e14_merged_file, shp_file, output_path = generate_file_paths(citycode_value, targetyear_value)
            return gradio_interface(tatemono_file
                                    , e14_merged_file
                                    , shp_file
                                    , ken
                                    , sikuchoson
                                    , join_option
                                    , output_format
                                    , output_path)
            
        match_button.click(
            fn=on_submit,
            inputs=[
                citycode
                , targetyear
                , ken
                , sikuchoson
                , option
                , output_format
            ],
            outputs=[
                output_file
                , results_text
            ]
        )

    iface.launch()
