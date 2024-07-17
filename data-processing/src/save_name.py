import sqlite3
import sys

def save_name(name, db_path):
    # データベースに接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # テーブルが存在しない場合は作成
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    ''')

    # 名前を挿入
    cursor.execute('INSERT INTO users (name) VALUES (?)', (name,))

    # 変更をコミットして接続を閉じる
    conn.commit()
    conn.close()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python save_name.py <name> <dbPath>")
        sys.exit(1)

    name = sys.argv[1]
    db_path = sys.argv[2]

    save_name(name, db_path)
    print(f"Name '{name}' has been saved to the database at '{db_path}'")
