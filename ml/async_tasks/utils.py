
from datetime import datetime
import sqlite3


CONNECTION = None
CURSOR = None

def connect_sqllite(db_path: str):
    global CONNECTION
    global CURSOR
    CONNECTION = sqlite3.connect(db_path)
    CURSOR = CONNECTION.cursor()
    create_table_if_not_exist()


def create_table_if_not_exist():
    CURSOR.execute("""
    create table if not exists jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT,
        type TEXT CHECK(type IN ('preprocess', 'ml', 'result')),
        parameters TEXT NOT NULL,
        
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    )
    """)
    CURSOR.execute("""
    create table if not exists job_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        progress_percent TEXT,
        preprocess_type TEXT,
        error_code TEXT,
        result BLOB,
        finished_at TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )
    """)

    CURSOR.execute("""
    create table if not exists job_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    )
    """)
    CONNECTION.commit()

def create_or_update_job(job_id: int, status: str, job_type: str = "", parameters: str = "") -> int:
    try:
        if job_id is None:
            CURSOR.execute("""
                INSERT INTO jobs (status, type, parameters) 
                    VALUES (?, ?, ?)
                        """, (status, job_type, parameters))
            job_id = CURSOR.lastrowid
        else:
            CURSOR.execute("""
                UPDATE jobs SET status = ? WHERE id = ?
                        """, (status, job_id))
            
        CONNECTION.commit()

        return job_id
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        CONNECTION.rollback()
        return None
    
def create_or_update_job_task(job_id: int, progress_percent: str, preprocess_type: str, error_code: str, result, id: int = None, is_finish: bool = False) -> int:
    try:
        finished_at = None
        if is_finish:
            finished_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if id is None:
            CURSOR.execute("""
            INSERT INTO job_tasks(job_id, progress_percent, preprocess_type, error_code, result)
            VALUES (?, ?, ?, ?, ?)
            """, (job_id, progress_percent, preprocess_type, error_code, result))
            id = CURSOR.lastrowid
        else:
            if progress_percent:
                CURSOR.execute("""
                UPDATE job_tasks SET progress_percent = ?, preprocess_type = ?, error_code = ?, result = ?, finished_at = ? WHERE id = ?
                """, (progress_percent, preprocess_type, error_code, result, finished_at, id))
            else:
                CURSOR.execute("""
                UPDATE job_tasks SET preprocess_type = ?, error_code = ?, result = ?, finished_at = ? WHERE id = ?
                """, (preprocess_type, error_code, result, finished_at, id))
        CONNECTION.commit()
        return id
    except Exception as e:
        print(f"An error occurred: {e}")
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
        print(f"An error occurred: {e}")
        CONNECTION.rollback()