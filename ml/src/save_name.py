import sqlite3
import sys
from migrate import migrate_database

def save_name(name, db_path):
    # まず、データベースのマイグレーションを実行
    migrate_database(db_path)

    # データベースに接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 名前を挿入
        cursor.execute('INSERT INTO users (name) VALUES (?)', (name,))

        # 変更をコミット
        conn.commit()
        print(f"名前 '{name}' をデータベース '{db_path}' に保存しました。")
    except sqlite3.Error as e:
        print(f"SQLiteエラー: {e}")
    except Exception as e:
        print(f"予期せぬエラー: {e}")
    finally:
        # 接続を閉じる
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("使用方法: python save_name.py <名前> <DBパス>")
        sys.exit(1)

    name = sys.argv[1]
    db_path = sys.argv[2]

    save_name(name, db_path)
