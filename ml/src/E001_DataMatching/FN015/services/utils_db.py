import sqlite3
from typing import List, Dict
import threading
import pandas as pd
from pyproj import Transformer

from FN015.services.constant_values import AMBIGUOUS_RSDT_ADDR_FLG
from FN015.services import crc32_lib
from FN015.types.match_level import MatchLevel
from FN015.types.pref_lg_code import PrefLgCode
from FN015.models.trie.char_node import CharNode
from FN015.models.trie.trie_finder import TrieAddressFinder

CONNECTION = None
DB_PATH = ""

_thread_local = threading.local()

def get_connection():
    if not hasattr(_thread_local, "conn"):
        _thread_local.conn = sqlite3.connect(DB_PATH)
    return _thread_local.conn

def close_connection():
    if hasattr(_thread_local, "conn"):
        _thread_local.conn.close()
        del _thread_local.conn


def connect_sqlite(db_path: str):
    global CONNECTION, DB_PATH
    DB_PATH = db_path
    CONNECTION = sqlite3.connect(db_path)

def close_sqlite():
    global CONNECTION
    if CONNECTION is not None:
        CONNECTION.close()
        CONNECTION = None

def init(path_sql, abrg_data):
    init_database(path_sql)
    connect_sqlite(path_sql)

    insert_pref(abrg_data)
    insert_city(abrg_data)
    insert_parcel(abrg_data)
    insert_town(abrg_data)
    insert_rsdtblk(abrg_data)
    close_sqlite()


def init_database(path_sql):
    sql_content = """
    CREATE TABLE IF NOT EXISTS pref (
        "pref_key" INTEGER PRIMARY KEY,
        "lg_code" TEXT,
        "pref" TEXT,
        "rep_lat" TEXT,
        "rep_lon" TEXT
      );

    CREATE TABLE IF NOT EXISTS "city" (
        "city_key" INTEGER PRIMARY KEY,
        "pref_key" INTEGER,
        "lg_code" TEXT UNIQUE,
        "county" TEXT,
        "city" TEXT,
        "ward" TEXT,
        "crc32" TEXT,
        "rep_lat" TEXT,
        "rep_lon" TEXT
      );

    CREATE TABLE IF NOT EXISTS "town" (
        "town_key" INTEGER PRIMARY KEY,
        "city_key" INTEGER,
        "machiaza_id" TEXT,
        "oaza_cho" TEXT,
        "chome" TEXT,
        "koaza" TEXT,
        "rsdt_addr_flg" TEXT,
        "koaza_aka_code" TEXT,
        "crc32" TEXT,
        "rep_lat" TEXT,
        "rep_lon" TEXT
      );

    CREATE TABLE IF NOT EXISTS "parcel" (
        "parcel_key" INTEGER PRIMARY KEY,
        "town_key" INTEGER DEFAULT null,
        "prc_id" TEXT,
        "prc_num1" TEXT,
        "prc_num2" TEXT,
        "prc_num3" TEXT,
        "crc32" TEXT,
        "rep_lat" TEXT,
        "rep_lon" TEXT
      );

    CREATE TABLE IF NOT EXISTS "rsdt_blk" (
        "rsdtblk_key" INTEGER PRIMARY KEY,
        "town_key" INTEGER,
        "blk_id" TEXT,
        "blk_num" TEXT,
        "crc32" TEXT,
        "rep_lat" TEXT,
        "rep_lon" TEXT
      );

    CREATE INDEX IF NOT EXISTS idx_parcel_town_key ON parcel(town_key, prc_id);
    
    CREATE INDEX IF NOT EXISTS idx_rsdt_blk_town_key ON rsdt_blk(town_key);
    
    CREATE INDEX IF NOT EXISTS idx_rsdt_blk_town_key_and_blk_num ON rsdt_blk(town_key, blk_num);

    """

    with open(path_sql, "w", encoding="utf-8") as file:
        file.write("")

    conn = sqlite3.connect(path_sql)
    cursor = conn.cursor()
    cursor.executescript(sql_content)

    conn.commit()
    conn.close()


def insert_city(abrg_data):
    sql_city = """
                INSERT INTO city (
                    city_key,
                    pref_key,
                    lg_code,
                    county,
                    city,
                    ward,
                    crc32
                ) VALUES (
                    :city_key,
                    :pref_key,
                    :lg_code,
                    :county,
                    :city,
                    :ward,
                    :crc32
                ) ON CONFLICT(city_key) DO UPDATE SET
                    lg_code = :lg_code,
                    county = :county,
                    city = :city,
                    ward = :ward
                WHERE 
                    crc32 != :crc32 OR
                    crc32 IS NULL
            """

    rows_city_pref = pd.read_csv(abrg_data['mt_city_pref'], usecols=["lg_code", "county", "city", "ward"])
    rows_city = rows_city_pref.fillna("").to_dict(orient="records")
    pref_key = get_pref_key(lg_code=rows_city[0]['lg_code'])
    upsert_rows_for_city(pref_key, sql_city, rows_city)
    del rows_city_pref, rows_city

    sql_city_pos = """
        INSERT INTO city (
            city_key,
            pref_key,
            rep_lat,
            rep_lon
          ) VALUES (
            :city_key,
            :pref_key,
            :rep_lat,
            :rep_lon
          ) ON CONFLICT (city_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
          WHERE 
            rep_lat != :rep_lat OR 
            rep_lon != :rep_lon OR 
            rep_lat IS NULL OR
            rep_lon IS NULL
    """

    rows_city_pos_pref = pd.read_csv(abrg_data['mt_city_pos_pref'],
                                     usecols=["lg_code", "rep_lat", "rep_lon", "rep_srid"])
    rows_city_pos = rows_city_pos_pref.fillna("").to_dict(orient="records")
    pref_key = get_pref_key(lg_code=rows_city_pos[0]['lg_code'])
    upsert_rows_for_city_pos(pref_key, sql_city_pos, rows_city_pos)
    del rows_city_pos_pref, rows_city_pos, pref_key


def insert_parcel(abrg_data):
    sql_parcel = """
            INSERT INTO parcel (
                parcel_key,
                town_key,
                prc_id,
                prc_num1,
                prc_num2,
                prc_num3,
                crc32
              ) VALUES (
                :parcel_key,
                :town_key,
                :prc_id,
                :prc_num1,
                :prc_num2,
                :prc_num3,
                :crc32
              ) ON CONFLICT (parcel_key) DO UPDATE SET
                prc_id = :prc_id,
                prc_num1 = :prc_num1,
                prc_num2 = :prc_num2,
                prc_num3 = :prc_num3,
                crc32 = :crc32
              WHERE 
                crc32 != :crc32 OR
                crc32 IS NULL
            """

    rows_parcel_pref = pd.read_csv(abrg_data['mt_parcel_city'],
                                   usecols=["lg_code", "prc_id", "prc_num1", "prc_num2", "prc_num3", "machiaza_id"],
                                   dtype={"machiaza_id": str, "prc_id": str, "prc_num1": str, "prc_num2": str,
                                          "prc_num2": str})
    rows_parcel = rows_parcel_pref.fillna("").to_dict(orient="records")
    upsert_rows_for_parcel(sql_parcel, rows_parcel)
    del rows_parcel_pref, rows_parcel

    sql_parcel_pos = """
        INSERT INTO parcel (
            parcel_key,
            town_key,
            rep_lat,
            rep_lon
          ) VALUES (
            :parcel_key,
            :town_key,
            :rep_lat,
            :rep_lon
          ) ON CONFLICT (parcel_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
          WHERE 
            rep_lat != :rep_lat OR 
            rep_lon != :rep_lon OR 
            rep_lat IS NULL OR
            rep_lon IS NULL
    """

    rows_parcel_pos_city = pd.read_csv(abrg_data['mt_parcel_pos_city'],
                                       usecols=["lg_code", "rep_lat", "rep_lon", "rep_srid", "machiaza_id", "prc_id"],
                                       dtype={"machiaza_id": str, "prc_id": str})
    rows_parcel_pos = rows_parcel_pos_city.fillna("").to_dict(orient="records")
    upsert_rows_for_parcel_pos(sql_parcel_pos, rows_parcel_pos)
    del rows_parcel_pos_city, rows_parcel_pos


def insert_town(abrg_data):
    sql_town = """
        INSERT INTO town (
            town_key,
            city_key,
            machiaza_id,
            oaza_cho,
            chome,
            koaza,
            rsdt_addr_flg,
            koaza_aka_code,
            crc32
          ) VALUES (
            :town_key,
            :city_key,
            :machiaza_id,
            :oaza_cho,
            :chome,
            :koaza,
            :rsdt_addr_flg,
            :koaza_aka_code,
            :crc32
          ) ON CONFLICT (town_key) DO UPDATE SET
            machiaza_id = machiaza_id,
            oaza_cho = oaza_cho,
            chome = chome,
            koaza = koaza,
            rsdt_addr_flg = rsdt_addr_flg,
            koaza_aka_code = koaza_aka_code,
            crc32 = @crc32
          WHERE
            crc32 != :crc32 OR
            crc32 IS NULL
        """

    rows_town_city = pd.read_csv(abrg_data['mt_town_city'],
                                 usecols=["lg_code", "machiaza_id", "oaza_cho", "chome", "koaza", "rsdt_addr_flg",
                                          "koaza_aka_code"], dtype={"machiaza_id": str})
    rows_town = rows_town_city.fillna("").to_dict(orient="records")
    pref_key = get_city_key(lg_code=rows_town[0]['lg_code'])
    upsert_rows_for_town(pref_key, sql_town, rows_town)
    del rows_town_city, rows_town

    sql_town_pos = """
        INSERT INTO town (
            town_key,
            city_key,
            machiaza_id,
            rep_lat,
            rep_lon
          ) VALUES (
            :town_key,
            :city_key,
            :machiaza_id,
            :rep_lat,
            :rep_lon
          ) ON CONFLICT (town_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
          WHERE 
            rep_lat != :rep_lat OR 
            rep_lon != :rep_lon OR 
            rep_lat IS NULL OR
            rep_lon IS NULL
    """

    rows_town_pos_city = pd.read_csv(abrg_data['mt_town_pos_city'],
                                     usecols=["lg_code", "rep_lat", "rep_lon", "rep_srid", "machiaza_id"],
                                     dtype={"machiaza_id": str})
    rows_town_pos = rows_town_pos_city.fillna("").to_dict(orient="records")
    upsert_rows_for_town_pos(pref_key, sql_town_pos, rows_town_pos)
    del rows_town_pos_city, rows_town_pos


def insert_rsdtblk(abrg_data):
    sql_blk = """
        INSERT INTO rsdt_blk (
            rsdtblk_key,
            town_key,
            blk_id,
            blk_num,
            crc32
          ) VALUES (
            :rsdtblk_key,
            :town_key,
            :blk_id,
            :blk_num,
            :crc32
          ) ON CONFLICT (rsdtblk_key) DO UPDATE SET
            blk_id = :blk_id,
            blk_num = :blk_num,
            crc32 = :crc32
          WHERE 
            crc32 != :crc32 OR
            crc32 IS NULL
        """

    rows_rsdt_blk = pd.read_csv(abrg_data['mt_rsdtdsp_blk_city'],
                                usecols=["lg_code", "machiaza_id", "blk_id", "rsdt_addr_flg", "blk_num"],
                                dtype={"blk_id": str, "machiaza_id": str})
    rows_blk = rows_rsdt_blk.fillna("").to_dict(orient="records")
    upsert_rows_for_blk(sql_blk, rows_blk)
    del rows_rsdt_blk, rows_blk

    sql_blk_pos = """
        INSERT INTO rsdt_blk (
            rsdtblk_key,
            town_key,
            rep_lat,
            rep_lon
          ) VALUES (
            :rsdtblk_key,
            :town_key,
            :rep_lat,
            :rep_lon
          ) ON CONFLICT (rsdtblk_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
          WHERE 
            rep_lat != :rep_lat OR 
            rep_lon != :rep_lon OR 
            rep_lat IS NULL OR
            rep_lon IS NULL
    """

    rows_rsdt_blk_pos = pd.read_csv(abrg_data['mt_rsdtdsp_blk_pos_city'],
                                    usecols=["lg_code", "rep_lat", "rep_lon", "rep_srid", "machiaza_id", "blk_id",
                                             "rsdt_addr_flg"], dtype={"blk_id": str, "machiaza_id": str})
    rows_blk_pos = rows_rsdt_blk_pos.fillna("").to_dict(orient="records")
    upsert_rows_for_blk_pos(sql_blk_pos, rows_blk_pos)
    del rows_rsdt_blk_pos, rows_blk_pos


def insert_rsdtdsp(abrg_data):
    sql_dsp = """
        INSERT INTO rsdt_dsp (
            rsdtdsp_key,
            rsdtblk_key,
            rsdt_id,
            rsdt2_id,
            rsdt_num,
            rsdt_num2,
            crc32
        ) VALUES (
            :rsdtdsp_key,
            :rsdtblk_key,
            :rsdt_id,
            :rsdt2_id,
            :rsdt_num,
            :rsdt_num2,
            :crc32
        ) ON CONFLICT (rsdtdsp_key) DO UPDATE SET
            rsdt_id = :rsdt_id,
            rsdt2_id = :rsdt2_id,
            rsdt_num = :rsdt_num,
            rsdt_num2 = :rsdt_num2,
            crc32 = :crc32
        WHERE 
            crc32 != :crc32 OR
            crc32 IS NULL
        """

    rows_rsdt_dsp = pd.read_csv(abrg_data['mt_rsdtdsp_blk_city'],
                                usecols=["lg_code", "rsdt_id", "machiaza_id", "blk_id", "rsdt2_id", "rsdt_num",
                                         "rsdt_num2", "rsdt_addr_flg"],
                                dtype={"rsdt_id": str, "rsdt2_id": str, "rsdt_num": str, "rsdt_num2": str,
                                       "blk_id": str, "machiaza_id": str})
    rows_blk = rows_rsdt_dsp.fillna("").to_dict(orient="records")
    upsert_rows_for_dsp(sql_dsp, rows_blk)
    del rows_rsdt_dsp, rows_blk

    sql_dsp_pos = """
        INSERT INTO rsdt_dsp (
            rsdtdsp_key,
            rsdtblk_key,
            rep_lat,
            rep_lon
          ) VALUES (
            :rsdtdsp_key,
            :rsdtblk_key,
            :rep_lat,
            :rep_lon
          ) ON CONFLICT (rsdtdsp_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
          WHERE
            rep_lat != :rep_lat OR 
            rep_lon != :rep_lon OR 
            rep_lat IS NULL OR
            rep_lon IS NULL
    """

    rows_rsdt_dsp_pos = pd.read_csv(abrg_data['mt_rsdtdsp_blk_pos_city'],
                                    usecols=["rep_lat", "rep_lon", "lg_code", "rsdt_id", "machiaza_id", "blk_id",
                                             "rsdt2_id", "rsdt_num", "rsdt_num2", "rsdt_addr_flg"],
                                    dtype={"rsdt_id": str, "rsdt2_id": str, "rsdt_num": str, "rsdt_num2": str,
                                           "blk_id": str, "machiaza_id": str})
    rows_dsp_pos = rows_rsdt_dsp_pos.fillna("").to_dict(orient="records")
    upsert_rows_for_dsp_pos(sql_dsp_pos, rows_dsp_pos)
    del rows_rsdt_dsp_pos, rows_dsp_pos


def insert_pref(abrg_data):
    sql_pref = """
        INSERT INTO pref (
            pref_key,
            lg_code,
            pref
        ) VALUES (
            :pref_key,
            :lg_code,
            :pref
        ) ON CONFLICT(pref_key) DO UPDATE SET
            lg_code = :lg_code,
            pref = :pref
    """

    rows_pref_all = pd.read_csv(abrg_data['mt_pref_all'], usecols=["lg_code", "pref"])
    rows_pref = rows_pref_all.fillna("").to_dict(orient="records")
    upsert_rows_for_pref(sql_pref, rows_pref)
    del rows_pref_all, rows_pref

    sql_pref_pos = """
        INSERT INTO pref (
            pref_key,
            rep_lat,
            rep_lon
        ) VALUES (
            :pref_key,
            :rep_lat,
            :rep_lon
        ) ON CONFLICT(pref_key) DO UPDATE SET
            rep_lat = :rep_lat,
            rep_lon = :rep_lon
        WHERE 
            rep_lat IS NULL OR
            rep_lon IS NULL OR
            rep_lat != :rep_lat OR
            rep_lon != :rep_lon
    """

    rows_pref_pos_all = pd.read_csv(abrg_data['mt_pref_pos_all'], usecols=["lg_code", "rep_lat", "rep_lon", "rep_srid"])
    rows_pref_pos = rows_pref_pos_all.fillna("").to_dict(orient="records")
    upsert_rows_for_pref_pos(sql_pref_pos, rows_pref_pos)
    del rows_pref_pos_all, rows_pref_pos


def upsert_rows_for_city(pref_key: int, sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["pref_key"] = pref_key
            row["city_key"] = get_city_key(row['lg_code'])
            row["crc32"] = crc32_lib.from_record(row)
            cursor.execute(sql, row)


def upsert_rows_for_city_pos(pref_key: int, sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["pref_key"] = pref_key
            row["city_key"] = get_city_key(row['lg_code'])
            row["crc32"] = crc32_lib.from_record(row)
            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84

            cursor.execute(sql, row)


def upsert_rows_for_pref(sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["pref_key"] = get_pref_key(lg_code=row['lg_code'])
            cursor.execute(sql, row)


def upsert_rows_for_pref_pos(sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["pref_key"] = get_pref_key(lg_code=row['lg_code'])
            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84
            cursor.execute(sql, row)


def upsert_rows_for_blk(sql: str, rows: List[Dict[str, str | int]]):
    lg_code = rows[0]['lg_code']
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            if row['rsdt_addr_flg'] == 0:
                continue
            row["town_key"] = get_town_key(lg_code, row['machiaza_id'])
            row["rsdtblk_key"] = get_rsdtBlk_key(lg_code, row['machiaza_id'], row['blk_id'])
            row["crc32"] = crc32_lib.from_record(row)
            cursor.execute(sql, row)


def upsert_rows_for_blk_pos(sql: str, rows: List[Dict[str, str | int]]):
    lg_code = rows[0]['lg_code']
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            if row['rsdt_addr_flg'] == 0:
                continue
            row["town_key"] = get_town_key(lg_code, row['machiaza_id'])
            row["rsdtblk_key"] = get_rsdtBlk_key(lg_code, row['machiaza_id'], row['blk_id'])
            row["crc32"] = crc32_lib.from_record(row)

            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84
            cursor.execute(sql, row)


def upsert_rows_for_dsp(sql: str, rows: List[Dict[str, str | int]]):
    lg_code = rows[0]['lg_code']
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            if row['rsdt_addr_flg'] == 0:
                continue

            row["rsdtblk_key"] = get_rsdtBlk_key(lg_code, row['machiaza_id'], row['blk_id'])
            row["rsdtdsp_key"] = get_rsdtDsp_key(lg_code, row['machiaza_id'], row['blk_id'], row['rsdt_id'],
                                                 row['rsdt2_id'])
            row["crc32"] = crc32_lib.from_record(row)
            cursor.execute(sql, row)


def upsert_rows_for_dsp_pos(sql: str, rows: List[Dict[str, str | int]]):
    lg_code = rows[0]['lg_code']
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            if row['rsdt_addr_flg'] == 0:
                continue
            row["rsdtblk_key"] = get_rsdtBlk_key(lg_code, row['machiaza_id'], row['blk_id'])
            row["rsdtdsp_key"] = get_rsdtDsp_key(lg_code, row['machiaza_id'], row['blk_id'], row['rsdt_id'],
                                                 row['rsdt2_id'])
            row["crc32"] = crc32_lib.from_record(row)

            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84
            cursor.execute(sql, row)


def upsert_rows_for_town(pref_key: int, sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["city_key"] = pref_key
            row["town_key"] = get_town_key(row['lg_code'], row['machiaza_id'])
            row["crc32"] = crc32_lib.from_record(row)
            cursor.execute(sql, row)


def upsert_rows_for_town_pos(pref_key: int, sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["city_key"] = pref_key
            row["town_key"] = get_town_key(row['lg_code'], row['machiaza_id'])
            row["crc32"] = crc32_lib.from_record(row)
            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84
            cursor.execute(sql, row)


def upsert_rows_for_parcel(sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["town_key"] = get_town_key(row['lg_code'], row['machiaza_id'])
            row["parcel_key"] = get_parcel_key(row['lg_code'], row['machiaza_id'], row['prc_id'])
            row["crc32"] = crc32_lib.from_record(row)
            cursor.execute(sql, row)


def upsert_rows_for_parcel_pos(sql: str, rows: List[Dict[str, str | int]]):
    with CONNECTION:
        cursor = CONNECTION.cursor()
        for row in rows:
            row["town_key"] = get_town_key(row['lg_code'], row['machiaza_id'])
            row["parcel_key"] = get_parcel_key(row['lg_code'], row['machiaza_id'], row['prc_id'])
            row["crc32"] = crc32_lib.from_record(row)
            source_crs = row["rep_srid"]
            target_crs = "EPSG:4326"
            transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)
            lon_wgs84, lat_wgs84 = transformer.transform(row["rep_lon"], row["rep_lat"])

            row["rep_lat"] = lat_wgs84
            row["rep_lon"] = lon_wgs84
            cursor.execute(sql, row)


def string_hash(s: str) -> int:
    hash_ = 5381
    for c in s:
        hash_ = ((hash_ << 5) + hash_) + ord(c)  # hash * 33 + c
        hash_ = hash_ & 0xFFFFFFFF  # keep 32-bit
    return hash_


def get_pref_key(lg_code):
    prefix = str(lg_code)[:2]
    return string_hash(prefix)


def get_city_key(lg_code):
    prefix = str(lg_code)
    return string_hash(prefix)


def get_town_key(lg_code, machiaza_id):
    key = f"{lg_code}/{machiaza_id}"
    return string_hash(key)


def get_parcel_key(lg_code, machiaza_id, prc_id):
    key = "/".join(
        str(x) for x in [lg_code, machiaza_id, prc_id]
        if x is not None and x != ""
    )
    return string_hash(key)


def get_rsdtBlk_key(lg_code, machiaza_id, blk_id):
    key = f"{lg_code}/{machiaza_id}/{blk_id}"
    return string_hash(key)


def get_rsdtDsp_key(lg_code, machiaza_id, blk_id, rsdt_id, rsdt2_id):
    key = "/".join(
        str(x) for x in [lg_code, machiaza_id, blk_id, rsdt_id, rsdt2_id]
        if x is not None and x != ""
    )
    return string_hash(key)


def get_pref_sql():
    return "SELECT pref_key, lg_code as lg_code, pref as pref, rep_lat as rep_lat, rep_lon as rep_lon FROM pref"


def get_pref_list():
    conn = get_connection()
    return pd.read_sql(f"{get_pref_sql()}", conn)


def get_city_sql():
    return f"SELECT city_key, pref_key, lg_code as lg_code, county as county, city as city, ward as ward, rep_lat as rep_lat, rep_lon as rep_lon FROM city"


def get_city_list() -> list[dict]:
    conn = get_connection()

    pref_map = get_pref_map()

    sql = get_city_sql()
    df = pd.read_sql(sql, conn)

    df["pref"] = df["pref_key"].apply(
        lambda key: pref_map.get(int(key), {}).get("pref", "")
    )
    return df.fillna("").to_dict(orient="records")


def get_pref_map() -> dict[int, dict]:
    df = get_pref_list()
    pref_map = {
        int(row["pref_key"]): row.to_dict()
        for _, row in df.iterrows()
    }
    return pref_map


def get_pref_map_by_lg_code(lg_code) -> dict[int, dict]:
    conn = get_connection()

    df = pd.read_sql(
        f"SELECT pref_key, lg_code as lg_code, pref as pref, rep_lat as rep_lat, rep_lon as rep_lon FROM pref WHERE lg_code = {lg_code}",
        conn)
    pref_map = {
        int(row["pref_key"]): row.to_dict()
        for _, row in df.iterrows()
    }
    return pref_map


def get_city_map_by_lg_code(lg_code) -> dict[int, dict]:
    conn = get_connection()

    pref_map = get_pref_map_by_lg_code(lg_code)

    sql = f"SELECT city_key, pref_key, lg_code as lg_code, county as county, city as city, ward as ward, rep_lat as rep_lat, rep_lon as rep_lon FROM city WHERE lg_code = {lg_code}"
    df = pd.read_sql(sql, conn)

    df["pref"] = df["pref_key"].apply(
        lambda key: pref_map.get(int(key), {}).get("pref", "")
    )
    city_rows = df.fillna("").to_dict(orient="records")

    city_map = {
        int(city["city_key"]): {
            **city,
            "pref": pref_map.get(int(city["pref_key"]), {}).get("pref", "")
        }
        for city in city_rows
    }

    return city_map


def get_city_map() -> dict[int, dict]:
    pref_map = get_pref_map()
    city_rows = get_city_list()

    city_map = {
        int(city["city_key"]): {
            **city,
            "pref": pref_map.get(int(city["pref_key"]), {}).get("pref", "")
        }
        for city in city_rows
    }

    return city_map


def get_county_and_city_list():
    city_map = get_city_map()

    results = []
    for city in city_map.values():
        if not city.get("county"):
            continue
        key = f"{city.get('county', '')}{city.get('city', '')}"
        results.append({
            "key": key,
            **city
        })

    return results


def get_city_and_ward():
    city_map = get_city_map()

    results = []
    for city in city_map.values():
        if city.get("city").endswith('区'):
            continue
        key = f"{city.get('city', '')}{city.get('ward', '')}"
        results.append({
            "key": key,
            **city
        })

    return results


def get_tokyo23_town_sql():
    return """
        SELECT
          c.pref_key,
          c.city_key,
          t.town_key,
          t.machiaza_id as machiaza_id,
          p.pref as pref,
          c.lg_code as lg_code,
          c.county as county,
          c.city as city,
          c.ward as ward,
          (
            c.city || 
            t.oaza_cho ||
            t.chome ||
            t.koaza
          ) AS key,

          t.oaza_cho as oaza_cho,
          t.chome as chome,
          t.koaza as koaza,
          CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
          t.rep_lat as rep_lat,
          t.rep_lon as rep_lon
        FROM 
          pref p
          JOIN city c ON p.pref_key = c.pref_key
          JOIN town t ON c.city_key = t.city_key
        WHERE
          c.city LIKE '%区' AND
          t.koaza_aka_code != '2' AND
          c.pref_key = :tokyo_pref_key
    """


def get_tokyo23_ward():
    city_map = get_city_map()

    tokyo_pref_key = get_pref_key(lg_code=PrefLgCode.TOKYO);

    results = []
    for city in city_map.values():
        if city.get('pref_key') == tokyo_pref_key:
            continue
        if city.get("city").endswith('区'):
            continue
        results.append({
            "key": city.get('city', ''),
            **city
        })

    return results


def get_kyoto_street_sql():
    return """
        SELECT
        c.city_key,
        t.town_key,
        c.pref_key,
        p.pref as pref,
        t.chome as chome,
        c.city as city,
        c.county as county,
        c.ward as ward,
        c.lg_code AS lg_code,
        t.oaza_cho as oaza_cho,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        CAST(t.koaza_aka_code AS INTEGER) as koaza_aka_code,
        t.koaza as koaza,
        t.machiaza_id as machiaza_id,
        t.rep_lat as rep_lat,
        t.rep_lon as rep_lon,
        IIF(
          substr(t.machiaza_id, 5, 7) = '000', 
          3,
          4
        ) as match_level,
        IIF(
          substr(t.machiaza_id, 5, 7) = '000', 
          3,
          4
        ) as coordinate_level
      FROM
        pref p
        JOIN city c ON p.pref_key = c.pref_key
        JOIN town t ON c.city_key = t.city_key
      WHERE
        -- 京都市に関係するLG_Codeは"261"から始まる
        -- 京都府全体は"260xxx"なので、PrefLgCode.KYOTOは使えない
        substr(c.lg_code, 1, 3) = '261' AND
        t.oaza_cho IS NOT NULL
    """


def get_wards_sql():
    return """
        SELECT
            p.pref_key,
            c.city_key,
            p.pref as pref,
            c.city as city,
            c.county as county,
            c.ward as ward,
            c.lg_code as lg_code,
            c.ward as key,

            c.rep_lat as rep_lat,
            c.rep_lon as rep_lon
        FROM
            pref as p
            JOIN city as c ON p.pref_key = c.pref_key
        WHERE
            c.ward != '' AND c.ward IS NOT NULL
    """


def get_rsdt_dsp_sql(rsdtblk_key: int = 0):
    sql = f"""
        SELECT
          rsdtdsp_key,
          rsdtblk_key,
          rsdt_id AS rsdt_id,
          rsdt2_id AS rsdt2_id,
          CAST(rsdt_id AS INTEGER) AS rsdt_num,

          IIF(
            rsdt2_id IS NOT NULL AND
            rsdt2_id != '',

            CAST(rsdt2_id AS INTEGER),

            NULL
          ) AS rsdt_num2,
          rep_lat as rep_lat,
          rep_lon as rep_lon
        FROM
          rsdt_dsp
      WHERE
          rsdtblk_key = {rsdtblk_key}
    """
    return sql


def get_parcel_sql(town_key=0, prc_id=''):
    sql = f"""
        SELECT
          parcel_key,
          IFNULL(town_key, 0) as town_key,
          prc_id as prc_id,
          prc_num1 as prc_num1,
          prc_num2 as prc_num2,
          prc_num3 as prc_num3,
          rep_lat as rep_lat,
          rep_lon as rep_lon
        FROM
          parcel
        WHERE
          town_key = {town_key} AND
          prc_id LIKE "{prc_id}"
    """
    return sql


def get_block_num_sql(town_key, blk_num):
    sql = f"""
        SELECT
            rsdtblk_key,
            town_key,
            blk_id AS blk_id,
            blk_num AS blk_num,
            rep_lat as rep_lat,
            rep_lon as rep_lon
          FROM
            rsdt_blk
          WHERE
          town_key = {town_key} AND
          blk_num = {blk_num}
    """
    return sql


def get_parcel_rows(town_key=0, prc_id=''):
    conn = get_connection()

    df = pd.read_sql(get_parcel_sql(town_key, prc_id), conn)
    return df.fillna("").to_dict(orient="records")


def get_rsdt_dsp_rows(rsdtblk_key: int = 0):
    conn = get_connection()

    df = pd.read_sql(get_rsdt_dsp_sql(rsdtblk_key), conn)
    return df.fillna("").to_dict(orient="records")


def get_block_num_rows(town_key: int = 0, blk_num: str = ''):
    conn = get_connection()

    df = pd.read_sql(get_block_num_sql(town_key, blk_num), conn)
    return df.fillna("").to_dict(orient="records")


def get_kyoto_street_rows() -> list[dict]:
    conn = get_connection()

    df = pd.read_sql(get_kyoto_street_sql(), conn)
    df = df.fillna("")
    machiaza_table = {}
    machiaza_detail_table = {}

    for _, row in df.iterrows():
        if not (row["oaza_cho"] or row["chome"] or row["koaza"]) or not row["rep_lat"]:
            continue

        key = f"{row['city_key']}:{row['machiaza_id']}"
        row_dict = row.to_dict()

        if row["match_level"] == 3:
            machiaza_table[key] = row_dict
        else:
            machiaza_detail_table[key] = row_dict

    results = []

    for row in machiaza_detail_table.values():
        row = row.copy()
        match_level = 'machiaza' if row["match_level"] == 3 else 'machiaza_detail'
        coordinate_level = 'machiaza' if row["coordinate_level"] == 3 else 'machiaza_detail'

        if not row["rep_lat"]:
            machiaza_key = f"{row['city_key']}:{row['machiaza_id'][:4]}000"
            machiaza = machiaza_table.get(machiaza_key)
            if machiaza:
                row["rep_lat"] = machiaza["rep_lat"]
                row["rep_lon"] = machiaza["rep_lon"]
                coordinate_level = 'machiaza'

        row["match_level"] = match_level
        row["coordinate_level"] = coordinate_level
        results.append(row)

    for row in machiaza_table.values():
        row = row.copy()
        row["match_level"] = 'machiaza'
        row["coordinate_level"] = 'machiaza'
        results.append(row)

    return results


def get_pref_list_generator_hash():
    return crc32_lib.from_string(get_pref_sql())


def get_county_and_city_list_generator_hash():
    return crc32_lib.from_string(get_city_sql())


def get_city_and_ward_list_generator_hash():
    return crc32_lib.from_string(get_city_sql())


def get_kyoto_street_generator_hash():
    return crc32_lib.from_string(get_kyoto_street_sql())


def get_wards_generator_hash():
    return crc32_lib.from_string(get_wards_sql())


def get_oazaChomes_generator_hash():
    key = "".join([
        get_oaza_chomes_sql1(),
        get_oaza_chomes_sql2(),
        get_oaza_chomes_sql3(),
        get_oaza_chomes_sql4(),
        get_oaza_chomes_sql5(),
        get_oaza_chomes_sql6(),
    ])

    return crc32_lib.from_string(key)


def get_tokyo23_wards_generator_hash():
    return crc32_lib.from_string(str(get_tokyo23_ward()))


def get_tokyo23_towns_generator_hash():
    return crc32_lib.from_string(get_tokyo23_town_sql())


def get_wards() -> list[dict]:
    conn = get_connection()
    sql = get_wards_sql()
    rows = pd.read_sql(sql, conn)

    rows["match_level"] = 2
    rows["coordinate_level"] = 2

    return rows.fillna("").to_dict(orient="records")


def get_tokyo23_towns() -> List[Dict]:
    conn = get_connection()

    sql = get_tokyo23_town_sql()
    params = {
        "tokyo_pref_key": get_pref_key(PrefLgCode.TOKYO)
    }
    df = pd.read_sql(sql, conn, params=params)
    return df.fillna("").to_dict(orient="records")


def get_oaza_chomes_sql1():
    return f"""
    SELECT
        (
          t.city_key ||
          substr(t.machiaza_id, 1, 4) ||
          '000*'
        ) as pkey,
        NULL as town_key,
        t.city_key,
        (substr(t.machiaza_id, 1, 4) || '000') as machiaza_id,
        t.koaza_aka_code as koaza_aka_code,
        t.oaza_cho as oaza_cho,
        '' as chome,
        '' as koaza,
        {AMBIGUOUS_RSDT_ADDR_FLG} as rsdt_addr_flg,
        c.rep_lat as rep_lat,
        c.rep_lon as rep_lon,
        {MatchLevel.MACHIAZA.value.num} as match_level,
        {MatchLevel.CITY.value.num} as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho != '' AND t.oaza_cho IS NOT NULL)
        AND substr(t.machiaza_id, 5, 7) != '000'
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    GROUP BY pkey
    """


def get_oaza_chomes_sql2():
    return f"""
    SELECT
        (
          t.city_key ||
          t.machiaza_id ||
          t.rsdt_addr_flg
        ) as pkey,
        t.town_key,
        t.city_key,
        t.machiaza_id as machiaza_id,
        t.oaza_cho as oaza_cho,
        t.chome as chome,
        '' as koaza,
        t.koaza_aka_code as koaza_aka_code,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        IFNULL(t.rep_lat, c.rep_lat) as rep_lat,
        IFNULL(t.rep_lon, c.rep_lon) as rep_lon,
        {MatchLevel.MACHIAZA_DETAIL.value.num} as match_level,
        IIF(t.rep_lat = '' OR t.rep_lat IS NULL, {MatchLevel.CITY.value.num}, {MatchLevel.MACHIAZA_DETAIL.value.num}) as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho != '' AND t.oaza_cho IS NOT NULL)
        AND substr(t.machiaza_id, 5, 7) != '000'
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    """


def get_oaza_chomes_sql3():
    return f"""
    SELECT
        (
          t.city_key ||
          t.machiaza_id ||
          t.rsdt_addr_flg
        ) as pkey,
        t.town_key,
        t.city_key,
        t.machiaza_id as machiaza_id,
        '' as oaza_cho,
        '' as chome,
        t.koaza as koaza,
        t.koaza_aka_code as koaza_aka_code,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        IFNULL(t.rep_lat, c.rep_lat) as rep_lat,
        IFNULL(t.rep_lon, c.rep_lon) as rep_lon,
        {MatchLevel.MACHIAZA_DETAIL.value.num} as match_level,
        IIF(t.rep_lat = '' OR t.rep_lat IS NULL, {MatchLevel.CITY.value.num}, {MatchLevel.MACHIAZA_DETAIL.value.num}) as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho = '' OR t.oaza_cho IS NULL)
        AND substr(t.machiaza_id, 5, 7) != '000'
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    """


def get_oaza_chomes_sql4():
    return f"""
    SELECT
        (
          t.city_key ||
          t.machiaza_id ||
          t.rsdt_addr_flg
        ) as pkey,
        t.town_key,
        t.city_key,
        t.machiaza_id as machiaza_id,
        '' as oaza_cho,
        t.chome as chome,
        t.koaza as koaza,
        t.koaza_aka_code as koaza_aka_code,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        IFNULL(t.rep_lat, c.rep_lat) as rep_lat,
        IFNULL(t.rep_lon, c.rep_lon) as rep_lon,
        {MatchLevel.MACHIAZA_DETAIL.value.num} as match_level,
        IIF(t.rep_lat = '' OR t.rep_lat IS NULL, {MatchLevel.CITY.value.num}, {MatchLevel.MACHIAZA_DETAIL.value.num}) as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho = '' OR t.oaza_cho IS NULL)
        AND (t.chome != '' AND t.chome IS NOT NULL)
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    """


def get_oaza_chomes_sql5():
    return f"""
    SELECT
        (
          t.city_key ||
          t.machiaza_id ||
          t.rsdt_addr_flg
        ) as pkey,
        t.town_key,
        t.city_key,
        t.machiaza_id as machiaza_id,
        t.oaza_cho as oaza_cho,
        t.chome as chome,
        t.koaza as koaza,
        t.koaza_aka_code as koaza_aka_code,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        IFNULL(t.rep_lat, c.rep_lat) as rep_lat,
        IFNULL(t.rep_lon, c.rep_lon) as rep_lon,
        {MatchLevel.MACHIAZA_DETAIL.value.num} as match_level,
        IIF(t.rep_lat = '' OR t.rep_lat IS NULL, {MatchLevel.CITY.value.num}, {MatchLevel.MACHIAZA_DETAIL.value.num}) as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho != '' AND t.oaza_cho IS NOT NULL)
        AND substr(t.machiaza_id, 5, 7) != '000'
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    """


def get_oaza_chomes_sql6():
    return f"""
    SELECT
        (
          t.city_key ||
          t.machiaza_id ||
          t.rsdt_addr_flg
        ) as pkey,
        t.town_key,
        t.city_key,
        t.machiaza_id as machiaza_id,
        t.oaza_cho as oaza_cho,
        t.chome as chome,
        t.koaza_aka_code as koaza_aka_code,
        '' as koaza,
        CAST(t.rsdt_addr_flg AS INTEGER) as rsdt_addr_flg,
        IFNULL(t.rep_lat, c.rep_lat) as rep_lat,
        IFNULL(t.rep_lon, c.rep_lon) as rep_lon,
        {MatchLevel.MACHIAZA.value.num} as match_level,
        IIF(t.rep_lat = '' OR t.rep_lat IS NULL, {MatchLevel.CITY.value.num}, {MatchLevel.MACHIAZA.value.num}) as coordinate_level
    FROM town t
    JOIN city c ON t.city_key = c.city_key
    JOIN pref p ON p.pref_key = c.pref_key
    WHERE
        (t.oaza_cho != '' AND t.oaza_cho IS NOT NULL)
        AND substr(t.machiaza_id, 5, 7) = '000'
        AND t.koaza_aka_code != '2'
        AND p.lg_code = :lg_code
    """


def get_oaza_chomes(lg_code_pref: str, lg_code_parcel: str) -> list[dict]:
    conn = get_connection()

    pref_map = get_pref_map_by_lg_code(lg_code_pref)
    city_map = get_city_map_by_lg_code(lg_code_parcel)
    if not pref_map or not city_map:
        return []

    work_table: dict[str, dict] = {}

    def insert_into_result_table(rows: list[dict]):

        for row in rows:
            if not row["oaza_cho"] and not row["chome"] and not row["koaza"] or not row["rep_lat"]:
                continue

            pkey = row["pkey"]
            if pkey.endswith("*"):
                work_table[pkey] = row
            elif pkey[-1] in ("0", "1"):
                other_key = pkey[:-1] + "*"
                if other_key in work_table:
                    prev = work_table.pop(other_key)
                    if prev["coordinate_level"] > row["coordinate_level"]:
                        row["coordinate_level"] = prev["coordinate_level"]
                        row["rep_lat"] = prev["rep_lat"]
                        row["rep_lon"] = prev["rep_lon"]
                    work_table[pkey[:-1] + "0"] = row
                    work_table[pkey[:-1] + "1"] = row
                work_table[pkey] = row

    for get_sql_func in [
        get_oaza_chomes_sql1,
        get_oaza_chomes_sql2,
        get_oaza_chomes_sql3,
        get_oaza_chomes_sql4,
        get_oaza_chomes_sql5,
    ]:
        sql = get_sql_func()
        rows = pd.read_sql(sql, conn, params={"lg_code": lg_code_pref}).fillna("").to_dict(orient="records")
        insert_into_result_table(rows)

    # Oaza tree
    oaza_tree = TrieAddressFinder()
    sql = get_oaza_chomes_sql6()
    rows = pd.read_sql(sql, conn, params={"lg_code": lg_code_pref}).fillna("").to_dict(orient="records")
    insert_into_result_table(rows)

    for row in rows:
        oaza_key = f"{row['city_key']}{row['machiaza_id'][:4]}"
        oaza_tree.append(
            key=oaza_key,
            value={
                "oaza_key": oaza_key,
                "rep_lat": row["rep_lat"],
                "rep_lon": row["rep_lon"],
                "coordinate_level": row["coordinate_level"]
            }
        )

    results = []
    seen = set()
    for row in work_table.values():
        key = f"{row['city_key']}:{row['machiaza_id']}:{row['rsdt_addr_flg']}"
        if key in seen:
            continue
        seen.add(key)

        city_info = city_map.get(row["city_key"])
        pref_info = pref_map.get(city_info["pref_key"])

        # If fallback to city level, try matching oaza
        if row["coordinate_level"] == MatchLevel.CITY.value.num:
            oaza_key = f"{row['city_key']}{row['machiaza_id'][:4]}"
            matched = oaza_tree.find(
                target=CharNode.create(oaza_key),
                fuzzy=None,
            ) or []
            if matched and len(matched) > 0:
                matched.sort(
                    key=lambda x: x.info['coordinate_level'] if x.info is not None else -1,
                    reverse=True
                )
                best = matched[0].info
                row["coordinate_level"] = best["coordinate_level"]
                if best["rep_lat"] and best["rep_lon"]:
                    row["rep_lat"] = best["rep_lat"]
                    row["rep_lon"] = best["rep_lon"]

        results.append({
            "rep_lat": row["rep_lat"],
            "rep_lon": row["rep_lon"],
            "koaza": row["koaza"],
            "chome": row["chome"],
            "oaza_cho": row["oaza_cho"],
            "machiaza_id": row["machiaza_id"],
            "town_key": row["town_key"],
            "rsdt_addr_flg": row["rsdt_addr_flg"],
            "lg_code": city_info["lg_code"],
            "ward": city_info["ward"],
            "county": city_info["county"],
            "city_key": city_info["city_key"],
            "pref_key": city_info["pref_key"],
            "match_level": match_level_label(row["match_level"]),
            "coordinate_level": match_level_label(row["coordinate_level"]),
            "pref": pref_info["pref"],
            "city": city_info["city"],
            "koaza_aka_code": row["koaza_aka_code"],
        })
    return results


def match_level_label(number):
    match number:
        case -1:
            return MatchLevel.ERROR.value._asdict()
        case 0:
            return MatchLevel.UNKNOWN.value._asdict()
        case 1:
            return MatchLevel.PREFECTURE.value._asdict()
        case 2:
            return MatchLevel.CITY.value._asdict()
        case 3:
            return MatchLevel.MACHIAZA.value._asdict()
        case 4:
            return MatchLevel.MACHIAZA_DETAIL.value._asdict()
        case 5:
            return MatchLevel.RESIDENTIAL_BLOCK.value._asdict()
        case 6:
            return MatchLevel.RESIDENTIAL_DETAIL.value._asdict()
        case 7:
            return MatchLevel.PARCEL.value._asdict()
        case _:
            raise ValueError(f"Unknown match level number: {number}")
