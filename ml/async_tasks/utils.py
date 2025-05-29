
from datetime import datetime, timezone
import sqlite3
import pandas as pd
from typing import List, Dict
import json

CONNECTION = None
CURSOR = None

def connect_sqllite(db_path: str):
    global CONNECTION
    global CURSOR
    CONNECTION = sqlite3.connect(db_path)
    CURSOR = CONNECTION.cursor()

def create_or_update_job(job_id: int, status: str, job_type: str = "", process_id: int = 0, is_named: int = 0, parameters: str = "", is_update_all: bool = False) -> int:
    try:
        if job_id is None:
            CURSOR.execute("""
                INSERT INTO jobs (status, type, parameters, process_id, is_named) 
                    VALUES (?, ?, ?, ?, ?)
                        """, (status, job_type, parameters, process_id, is_named))
            job_id = CURSOR.lastrowid
        elif is_update_all:
            CURSOR.execute("""
                UPDATE jobs SET status = ?, type = ?, parameters = ?, process_id = ?, is_named = ? WHERE id = ?
                        """, (status, job_type, parameters, process_id, is_named, job_id))
        else:
            CURSOR.execute("""
                UPDATE jobs SET status = ? WHERE id = ?
                        """, (status, job_id))
            
        CONNECTION.commit()

        return job_id
    except sqlite3.Error as e:
        CONNECTION.rollback()
        return None
    
def create_or_update_job_task(job_id: int, progress_percent: str, preprocess_type: str|None, error_code: str, error_msg: str, result, id: int = None, is_finish: bool = False) -> int:
    try:
        finished_at = None
        if is_finish:
            finished_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        if id is None:
            CURSOR.execute("""
            INSERT INTO job_tasks(job_id, progress_percent, preprocess_type, error_code, result)
            VALUES (?, ?, ?, ?, ?)
            """, (job_id, progress_percent, preprocess_type, error_code, result))
            id = CURSOR.lastrowid
        else:
            if progress_percent:
                CURSOR.execute("""
                UPDATE job_tasks SET progress_percent = ?, preprocess_type = ?, error_code = ?, error_msg = ?, result = ?, finished_at = ? WHERE id = ?
                """, (progress_percent, preprocess_type, error_code, error_msg, result, finished_at, id))
            else:
                CURSOR.execute("""
                UPDATE job_tasks SET preprocess_type = ?, error_code = ?, error_msg = ?, result = ?, finished_at = ? WHERE id = ?
                """, (preprocess_type, error_code, error_msg, result, finished_at, id))
        CONNECTION.commit()
        return id
    except Exception as e:
        CONNECTION.rollback()
        raise e
    
def create_job_results(job_id: int, file_path: str):
    try:
        CURSOR.execute("""
                    INSERT INTO job_results (job_id, file_path) 
                        VALUES (?, ?)
                            """, (job_id, file_path))
        CONNECTION.commit()
    except sqlite3.Error as e:
        CONNECTION.rollback()
        
def concatenate(path_1: str, path_2: str):
    try:
        return f"{path_1}/{path_2}".replace("//", "/")
    except:
        return path_2
    
def create_data_set_detail_buildings_or_area(input_data, table_name="data_set_detail_buildings"):
    try:
        input_data.to_sql(table_name, CONNECTION, if_exists='append', index=False)
        return True
    except sqlite3.Error as e:
        return False
        
def create_data_set_results(title: str = ""):
    try:
        current_date = datetime.now().strftime('%m%d')
        base_title = f"空き家推定結果_{current_date}"
        title = base_title

        sql_check = f'SELECT COUNT(*) FROM data_set_results WHERE title LIKE "{base_title}%"'
        CURSOR.execute(sql_check)
        count = CURSOR.fetchone()[0]
        
        if count > 0:
            title = f"{base_title}_{count + 1}"
                    
        sql = f'INSERT INTO data_set_results (title) VALUES ("{title}")'
        CURSOR.execute(sql)
        CONNECTION.commit()
        id = CURSOR.lastrowid
        return id
    except sqlite3.Error as e:
        CONNECTION.rollback()
        return None
    
def get_data_result_views(sheet_id):
    try:
        return pd.read_sql(f"SELECT * FROM result_views where id = {sheet_id}", CONNECTION)
    except sqlite3.Error as e:
        return None

def filter_query_builder(conditions: List[Dict]) -> List[str]:
    sql_conditions = []

    for cond in conditions:
        cond = cond.get("value")
        col = cond.get("referenceColumn", None)
        op = cond.get("operation", None)
        col_type = cond.get("referenceColumnType", None)
        if col and col_type:
            if col_type in ["text", "date"]:
                val = f"'{cond['value']}'"
                if op == "eq":
                    sql_conditions.append(f"{col} = {val}")
                elif op == "noteq":
                    sql_conditions.append(f"{col} != {val}")
                elif op == "contains":
                    sql_conditions.append(f"{col} LIKE '%{cond['value']}%'")
                elif op == "notContains":
                    sql_conditions.append(f"{col} NOT LIKE '%{cond['value']}%'")
                elif op in ["gt", "gte", "lt", "lte"]:
                    ops_map = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<="}
                    sql_conditions.append(f"{col} {ops_map[op]} {val}")

            elif col_type in ["integer", "float"]:
                val = cond["value"]
                if op == "eq":
                    sql_conditions.append(f"{col} = {val}")
                elif op == "noteq":
                    sql_conditions.append(f"{col} != {val}")
                elif op in ["gt", "gte", "lt", "lte"]:
                    ops_map = {"gt": ">", "gte": ">=", "lt": "<", "lte": "<="}
                    sql_conditions.append(f"{col} {ops_map[op]} {val}")

            elif col_type in ["integerRange", "floatRange"]:
                if op == "range":
                    start = cond.get("startValue")
                    end = cond.get("lastValue")
                    include_start = ">=" if cond.get("includesStart") else ">"
                    include_end = "<=" if cond.get("includesLast") else "<"
                    sql_conditions.append(f"{col} {include_start} {start} AND {col} {include_end} {end}")

            elif col_type == "dateRange":
                if op == "range":
                    start = cond.get("startValue")
                    end = cond.get("lastValue")
                    include_start = ">=" if cond.get("includesStart") else ">"
                    include_end = "<=" if cond.get("includesLast") else "<"
                    sql_conditions.append(f"{col} {include_start} '{start}' AND {col} {include_end} '{end}'")

            elif col_type == "boolean":
                if op == "isTrue":
                    sql_conditions.append(f"{col} = 1")
                elif op == "isFalse":
                    sql_conditions.append(f"{col} = 0")

    return sql_conditions

def format_sql(sql, params):
    for param in params:
        if isinstance(param, str):
            param = f"'{param}'"
        elif param is None:
            param = "NULL"
        sql = sql.replace("?", str(param), 1)
    return sql

def get_data_set_detail_buildings_or_area(view: dict):
    try:
        # All param for filter
        data_set_result_id = view.get("data_set_result_id")
        reference_date = view.get("reference_date", None)
        parameters = json.loads(view.get("parameters", "[]"))
        year_filter = next((p for p in parameters if p.get("key") == "year"), None)
        area_filter = next((p for p in parameters if p.get("key") == "area"), None)
        columns = next((p for p in parameters if p.get("key") == "columns" and p.get("type") == "column"), None)
        filter_conditions = [p for p in parameters if p.get("key").startswith("filter_")]

        table_name = "data_set_detail_buildings" if view.get("unit") == 'building' else 'data_set_detail_areas'
        columns_name = "*"
        if columns is not None:
            columns_name = columns.get("value")
            if "geometry" not in columns_name.split(","):
                columns_name += ", geometry"

        sql = f"SELECT {columns_name} FROM {table_name} WHERE data_set_result_id = ?"
        params = [data_set_result_id]

        if reference_date: 
            sql += " AND reference_date = ?"
            params.append(reference_date)
        # Year filter
        if year_filter:
            if "start" in year_filter["value"] and year_filter["value"]["start"]:
                sql += " AND reference_date >= ?"
                params.append(f"{year_filter['value']['start']}-01-01")
            if "end" in year_filter["value"] and year_filter["value"]["end"]:
                sql += " AND reference_date <= ?"
                params.append(f"{year_filter['value']['end']}-12-31")

        # Area filter
        if area_filter and area_filter.get("value"):
            placeholders = ", ".join(["?"] * len(area_filter["value"]))
            sql += f" AND area_group IN ({placeholders})"
            params.extend(area_filter["value"])

        # --- Dynamic filters
        if filter_conditions:
            filter_sql = filter_query_builder(filter_conditions)
            sql += " AND " + " AND ".join(filter_sql) if filter_sql else ""
        
        # Load data
        df = pd.read_sql(sql, CONNECTION, params=params)

        return df
    except Exception as e:
        raise