"""
# E015 空間結合機能
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

import numpy as np
import pandas as pd
import geopandas as gpd
import gradio as gr

from pyproj import Transformer
from shapely import wkt
from shapely.geometry import MultiPolygon, Polygon, Point

pd.set_option("display.max_columns", None)

# 水道データ結合の際の、オプション。0；交差結合、1:最近傍結合
option = 0

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
    "美幌町", "津別町", "斜里町", "清里町", "小清水町", "訓子府町", "置戸町", "佐呂間町", "大空町","東藻琴村","女満別町", 
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

def setup_directory():
   """
   作業ディレクトリを設定する
   戻り値:
   links04_path (str): 作成されたLinks04ディレクトリへのパス
   """
   # ユーザーのホームディレクトリ内にLinks04フォルダのパスを生成
   links04_path = os.path.join(os.path.expanduser('~'), 'Links04')
   # Links04フォルダが存在しない場合は作成
   os.makedirs(links04_path, exist_ok=True)
   # 現在の作業ディレクトリをLinks04フォルダに変更
   os.chdir(links04_path)
   return links04_path

def load_csv(folder_path, file_name, encodings=['utf-8', 'shift_jis', 'cp932']):
    """
    指定されたフォルダからCSVファイルを読み込む
    引数:
    folder_path (str): CSVファイルを含むフォルダへのパス
    file_name (str): 読み込むCSVファイルの名前
    encodings (list): 試すエンコーディングのリスト
    戻り値:
    DataFrame: CSVファイルのデータを含むDataFrame
    例外:
    FileNotFoundError: 指定されたファイルが存在しない場合
    UnicodeDecodeError: 指定されたエンコーディングでデコードできない場合
    """
    # フォルダパスとファイル名を結合してフルパスを生成し、パス形式を統一
    file_path = os.path.join(folder_path, file_name).replace("\\", "/")
    
    # ファイルが存在するか確認
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    
    # CSVファイルを読み込んでDataFrameとして返す
    for encoding in encodings:
        try:
            return pd.read_csv(file_path, encoding=encoding, low_memory=False)
        except UnicodeDecodeError:
            continue
    
    raise UnicodeDecodeError(f"Failed to decode the file {file_path} with encodings: {encodings}")

def load_and_process_data(file_path, is_tatemono=True):
    """
    CSVファイルを読み込み、ジオメトリデータを処理してGeoDataFrameを作成する
    引数:
    file_path (str): 読み込むCSVファイルのパス
    is_tatemono (bool): 建物データであるかどうかを示すフラグ（デフォルトはTrue） 
    戻り値:
    GeoDataFrame: 処理されたジオメトリデータを含むGeoDataFrame
    """
    # CSVファイルを読み込む
    df = load_csv(os.path.dirname(file_path), os.path.basename(file_path))
    
   # geometry列が存在するか確認
    if 'geometry' in df.columns:
        # geometry列が文字列のデータのみを保持
        df = df[df['geometry'].apply(lambda x: isinstance(x, str))]
        # geometry列をWKT形式からShapely geometryオブジェクトに変換
        df['geometry'] = df['geometry'].apply(parse_wkt)
    else:
        # もしgeometry列が存在しない場合、lat/lonからgeometry列を作成
        if 'lat_geocoding_cleaned' in df.columns and 'lon_geocoding_cleaned' in df.columns:
            # lat_geocoding_cleaned と lon_geocoding_cleaned 列からジオメトリデータを作成
            df['geometry'] = df.apply(lambda row: Point(row['lat_geocoding_cleaned'], row['lon_geocoding_cleaned']), axis=1)
        else:
            raise KeyError("'geometry' column or 'lat_geocoding_cleaned' and 'lon_geocoding_cleaned' columns are required")

    # 無効なジオメトリを除外
    df = df[df['geometry'].notnull()]

    # GeoDataFrameを作成
    gdf = gpd.GeoDataFrame(df, geometry='geometry', crs=4326)
    return gdf

def get_transformer(pref: str, city: str) -> int:
    """
    自治体名から、使うべきEPSGコードを返す
    引数:
    pref (str): 都道府県名
    city (str): 市区町村名
    戻り値:
    int: 該当する地域のEPSGコード
    """
    # 都道府県名と市区町村名から座標系番号を取得
    number = get_coordinate_system_number(pref, city)
    # 座標系番号からEPSGコードを取得して返す
    return get_epsg(number)

def get_epsg(coordinate_system_number: int) -> int:
    """
    平面直角座標系の番号からEPSGコードを返す
    引数:
    coordinate_system_number (int): 平面直角座標系の番号 (1-19に対応するI-XIX)
    戻り値:
    int: 対応するEPSGコード
    """
    # 平面直角座標系の番号に6668を加算してEPSGコードを生成
    return 6668 + coordinate_system_number

def get_coordinate_system_number(pref: str, city: str) -> int:
    """
    自治体名から、使うべき平面直角座標系コード(I, II, III, ..., XIX)を返す
    引数:
    pref (str): 自治体の都道府県名
    city (str): 自治体の市区町村名
    戻り値:
    int: 該当する平面直角座標系コード
    """
    if result := PREF_TO_COORD_NUMBER.get(pref):
        return result

    if pref == "鹿児島県":
        if any(city_part in city for city_part in NUMBER_1_CITIES):
            return 1
        return 2
    if pref == "東京都":
        if any(city_part in city for city_part in NUMBER_14_CITIES):
            return 14
        return 9
        # 沖ノ鳥島(18), 南鳥島(19)は小笠原村だが、父島で代表させるので該当なし
    if pref == "北海道":
        if any(city_part in city for city_part in NUMBER_11_CITIES):
            return 11
        if any(city_part in city for city_part in NUMBER_13_CITIES):
            return 13
        return 12
    if pref == "沖縄県":
        if any(city_part in city for city_part in NUMBER_16_CITIES):
            return 16
        if any(city_part in city for city_part in NUMBER_17_CITIES):
            return 17
        return 15

def parse_wkt(wkt_str):
    """
    WKT (Well-Known Text) 文字列を解析してジオメトリオブジェクトを生成する
    引数:
    wkt_str (str): 解析するWKT文字列
    戻り値:
    Geometry: WKT文字列から生成されたジオメトリオブジェクト
    例外:
    Exception: 解析中にエラーが発生した場合、エラーメッセージを出力し、Noneを返す
    """
    try:
        return wkt.loads(wkt_str)
    except Exception as e:
        print(f"Error parsing WKT: {e}")
        return None

def assign_points_to_buildings(buildings_gdf, points_gdf, mul, crs, point_selected_column, option):
    """
    建物のジオメトリとポイントのジオメトリを結合し、ポイントを建物に割り当てる
    引数:
    buildings_gdf (GeoDataFrame): 建物のジオメトリを含むGeoDataFrame
    points_gdf (GeoDataFrame): ポイントのジオメトリを含むGeoDataFrame
    mul (float): バッファ半径を計算するための乗数
    crs (int): 座標参照系
    point_selected_column (str): ポイントの選択列名
    option (int): 結合オプション (1: 最近接結合, それ以外: 干渉結合)
    戻り値:
    tuple: 結合後のGeoDataFrameと結合率を含むタプル
    """
    # 結合するカラムを指定
    points_gdf = points_gdf[point_selected_column]

    # バッファ作成の準備
    # 重心の計算
    buildings_gdf["centroid"] = buildings_gdf["geometry"].centroid
    # 面積の計算
    buildings_gdf["area"] = buildings_gdf["geometry"].area

    # 重心から面積と同サイズのバッファを生成
    rad = (mul * buildings_gdf["area"] / math.pi) ** 0.5

    # bufferをgeometryにする（空間結合の準備）
    buildings_gdf["buffer"] = buildings_gdf["centroid"].buffer(rad)
    buildings_gdf = buildings_gdf.set_geometry("buffer")

    # points_gdfにID付与（空間結合後の重複削除のために、重心との距離計算をするための準備）
    points_gdf['ID'] = range(1, len(points_gdf) + 1)
    # クイックルックアップのための辞書を作成する
    geometry_dict = points_gdf.set_index('ID')['geometry'].to_dict()

    if option == 1:
        joined = gpd.sjoin_nearest(points_gdf, buildings_gdf, how='right')
        joined = joined.set_geometry("geometry")
        combined_gdf = joined.drop(columns=["index_left","buffer","centroid","area"])
    else:
        # 空間結合(交差)の実行（ここで、水道のデータが2つ以上結合されている場合があるので、最も近いもののみを残す）
        joined = gpd.sjoin(points_gdf, buildings_gdf, how='right', predicate='intersects')
        
        # 距離を計算します。IDがNaNでない場合のみ計算します。
        joined["distance"] = joined.apply(lambda row: row["centroid"].distance(geometry_dict[row["ID"]]) if not pd.isnull(row["ID"]) else None, axis=1)
        #　sjoinでindexが重複しているので、リセット
        joined = joined.reset_index(drop=True)
        # IDが存在する行
        filtered_gdf = joined.dropna(subset=['ID'])
        # IDが存在しない行
        dropped_rows = joined[joined['ID'].isna()]
        # IDが存在する行で'buildingID'をキーにして、'distance'が最小のものを抽出(空間結合による重複を削除)
        result_gdf = joined.loc[filtered_gdf.groupby('buildingID')['distance'].idxmin().tolist()]
        
        # IDあり（重複解消済み）とIDなしの結合
        combined_gdf = pd.concat([dropped_rows, result_gdf])
        # 建物のジオメトリに設定しなおして、GeoDataFrameに変換
        combined_gdf = gpd.GeoDataFrame(combined_gdf, geometry='geometry')
        # 使用後の不要な列を削除
        combined_gdf = combined_gdf.drop(columns=["centroid", "area","index_left",'buffer',"distance"])
    
    combined_gdf.to_crs(4326, inplace=True)
    # 結合率の算出
    num_points = points_gdf.shape[0]
    unique_values_count = combined_gdf["ID"].nunique()
    join_ratio = round(unique_values_count/num_points*100, 2)
    combined_gdf = combined_gdf.drop(columns=["ID"])
    return combined_gdf, join_ratio

def generate_random_string(length=4):
    """
    指定された長さのランダムな文字列を生成する
    引数:
    length (int): 生成する文字列の長さ（デフォルトは4）
    戻り値:
    str: ランダムに生成された文字列
    """
    # 使用する文字のセット（英数字）を定義
    characters = string.ascii_letters + string.digits
    # 指定された長さのランダムな文字列を生成して返す
    return ''.join(random.choice(characters) for i in range(length))

def add_residenceID(gdf):
    """
    GeoDataFrameにresidenceID列を追加する
    引数:
    gdf (GeoDataFrame): GeoDataFrame、'buildingID'列を含む必要がある
    """
    # 'buildingID'列とランダムに生成された文字列を結合して'residenceID'列を作成
    gdf['residenceID'] = gdf['buildingID'] + '-' + gdf.apply(lambda _: generate_random_string(), axis=1)

def save_geodataframe(gdf, output_path, output_type):
    """
    GeoDataFrameを指定された形式で保存する
    引数:
    gdf (GeoDataFrame): 保存するGeoDataFrame
    output_path (str): 出力ファイルのパス
    output_type (str): 出力形式（'gpkg'または'csv'）
    例外:
    ValueError: サポートされていない出力形式が指定された場合
    """
    if output_type == 'gpkg':
        # GeoPackage形式で保存
        gdf.to_file(output_path, driver="GPKG", encoding="shift-jis")
    elif output_type == 'csv':
        # CSV形式で保存 
        try:
            # まず、Shift-JISでの保存を試みる
            gdf.to_csv(output_path, index=False, encoding='shift_jis')
        except UnicodeEncodeError:
            # Shift-JISが失敗した場合、CP932を使用する
            gdf.to_csv(output_path, index=False, encoding='cp932')
    else:
        # サポートされていない出力形式が指定された場合、例外を発生させる
        raise ValueError(f"Unsupported output type: {output_type}")

def process_data(tatemono_path, water_supply_path, ken, sikuchoson, option, output_type):
    """
    建物データと水道データを処理して結果を保存する
    引数:
    tatemono_path (str): 建物データのファイルパス
    water_supply_path (str): 水道データのファイルパス
    ken (str): 県の名前
    sikuchoson (str): 市区町村の名前
    option (str): オプション設定
    output_type (str): 出力形式（'gpkg'または'csv'）
    戻り値:
    tuple: 出力ファイルのパスと結合率
    """
    # 作業ディレクトリを設定
    links04_path = setup_directory()

    # 建物データと水道データを読み込み、処理
    tatemono = load_and_process_data(tatemono_path)
    water_supply = load_and_process_data(water_supply_path, is_tatemono=True)
    
    # 座標系を設定
    crs = get_transformer(ken, sikuchoson)
    tatemono.to_crs(crs, inplace=True)
    water_supply.to_crs(crs, inplace=True)
    
    # 水道データの全列を選択
    point_selected_column = water_supply.columns
    
    # 建物データと水道データを結合
    tatemono_use_point, join_ratio = assign_points_to_buildings(tatemono, water_supply, 2, crs, point_selected_column, option)
    
    # 住居IDを追加
    add_residenceID(tatemono_use_point)
    
    # 結果を保存
    output_path = os.path.join(links04_path, f"D901.{output_type}")
    save_geodataframe(tatemono_use_point, output_path, output_type)
    
    return output_path, join_ratio

def gradio_interface(tatemono_file, water_supply_file, ken, sikuchoson, join_option, output_format):
    """
    Gradioインターフェース用の関数。建物データと水道データを処理し、結果を出力する。
    引数:
    tatemono_file (File): 建物データのファイル
    water_supply_file (File): 水道データのファイル
    ken (str): 県の名前
    sikuchoson (str): 市区町村の名前
    join_option (str): 結合オプション（"交差結合"または"最近傍結合"）
    output_format (str): 出力形式（'gpkg'または'csv'）
    戻り値:
    tuple: 出力ファイルのパスと結合率のメッセージ
    """
    # 結合オプションを設定（0: 交差結合、1: 最近傍結合）
    option = 0 if join_option == "交差結合" else 1
    # データ処理を実行
    output_path, join_ratio = process_data(tatemono_file.name, water_supply_file.name, ken, sikuchoson, option, output_format)
    # 結果を返す
    return output_path, f"結合率: {join_ratio}%"

iface = gr.Interface(
    fn=gradio_interface,
    inputs=[
        gr.File(label="【D401】テキストマッチングデータ (CSV)"),
        gr.File(label="【D101、D102、D106】空き家基盤データ (CSV)"),
        gr.Textbox(label="都道府県", value="愛知県"),
        gr.Textbox(label="市区町村", value="豊田市"),
        gr.Radio(["交差結合", "最近傍結合"], label="結合方式"),
        gr.Radio(["csv", "gpkg"], label="出力形式")
    ],
    outputs=[
        gr.File(label="出力ファイル"),
        gr.Textbox(label="結合率")
    ],
    title="E015 - 空間結合機能",
    description="２つ以上の地理的な位置情報を持つ異なるインプットデータに対して、地理的な重なり関係から結合処理を行う機能。"
)

if __name__ == "__main__":
    iface.launch()