import os
import sqlite3

def get_latest_migration(migrations_dir):
    sql_files = [f for f in os.listdir(migrations_dir) if f.endswith('.sql')]
    return os.path.join(migrations_dir, max(sql_files)) if sql_files else None

def execute_migration(cursor, migration_path):
    with open(migration_path, 'r') as f:
        migration_sql = f.read()
    cursor.executescript(migration_sql)

def migrate_database(db_path, migrations_dir='./drizzle'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        latest_migration = get_latest_migration(migrations_dir)

        if latest_migration:
            print(f"最新のマイグレーションファイル: {latest_migration}")
            execute_migration(cursor, latest_migration)
            print(f"データベース '{db_path}' のマイグレーションが完了しました。")
        else:
            print(f"警告: マイグレーションファイルが '{migrations_dir}' ディレクトリに見つかりません。")

        conn.commit()
    except sqlite3.Error as e:
        print(f"SQLiteエラー: {e}")
        conn.rollback()
    except Exception as e:
        print(f"予期せぬエラー: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    # このスクリプトを直接実行した場合のテスト用コード
    import sys
    if len(sys.argv) != 2:
        print("使用方法: python migrate.py <DBパス>")
        sys.exit(1)

    db_path = sys.argv[1]
    migrate_database(db_path)
