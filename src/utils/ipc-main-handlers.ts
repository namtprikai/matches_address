import { type ipcMain } from "electron";
import { database } from "./database";

export type IpcMainHandlersKey = "getNames" | "saveName";

// ipcMain.handle()のハンドラ関数を定義する
export const ipcMainHandlers: {
  [K in IpcMainHandlersKey]: Parameters<typeof ipcMain.handle>[1];
} = {
  getNames: (): {
    id: number;
    name: string;
  }[] => {
    database.exec(
      "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
    );
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
