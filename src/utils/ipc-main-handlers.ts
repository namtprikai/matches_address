import { type ipcMain } from "electron";
import { existsSync } from "fs";
import { type Database } from "better-sqlite3";
import { database, databasePath } from "./database";

export type IpcMainHandlersKey = "getNames" | "saveName";

// ipcMain.handle()のハンドラ関数を定義する
export const ipcMainHandlers: {
  [K in IpcMainHandlersKey]: Parameters<typeof ipcMain.handle>[1];
} = {
  getNames: (): {
    id: number;
    name: string;
  }[] => {
    const initTestTable = (): Database =>
      database.exec(
        "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
      );

    // 開発サーバーの起動ごとにデータが消えてしまうので、dbファイルが存在しない場合のみ初期化する
    if (process.env.NODE_ENV === "development") {
      if (!existsSync(databasePath)) {
        initTestTable();
      }
    } else {
      // 本番ビルドの場合はデータが消えないので初期化する
      // たぶん本番では`CREATE TABLE IF NOT EXISTS {table_name}`がちゃんと動いているっぽい
      initTestTable();
    }

    if (database.prepare("SELECT * FROM test").all().length === 0) {
      database.prepare("INSERT INTO test (name) VALUES (?)").run("John Doe");
    }

    const rows = database.prepare("SELECT * FROM test").all() as {
      id: number;
      name: string;
    }[];

    return rows;
  },
  saveName: (_: unknown, text: string): void => {
    database.exec(
      "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
    );
    database.prepare("INSERT INTO test (name) VALUES (?)").run(text);
  },
};
