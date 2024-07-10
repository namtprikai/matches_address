import { database } from "./database";

// ipcMain.handle()のハンドラ関数を定義する
export const ipcMainHandlers = {
  getSqliteRows: (): {
    id: number;
    name: string;
  }[] => {
    database.exec(
      "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
    );
    if (database.prepare("SELECT * FROM test").all().length === 0) {
      database
        .prepare("INSERT INTO test (name) VALUES (?)")
        .run("Hello, Better SQLite3!");
    }
    const rows = database.prepare("SELECT * FROM test").all() as {
      id: number;
      name: string;
    }[];

    return rows;
  },
};

export type IpcMainHandlersKey = keyof typeof ipcMainHandlers;
