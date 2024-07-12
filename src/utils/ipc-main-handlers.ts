import { type ipcMain } from "electron";
import { db } from "./db";

export type IpcMainHandlersKey = "getNames" | "saveName";

function initTestTable(): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
  );
}

// ipcMain.handle()のハンドラ関数を定義する
export const ipcMainHandlers: {
  [K in IpcMainHandlersKey]: Parameters<typeof ipcMain.handle>[1];
} = {
  getNames: (): {
    id: number;
    name: string;
  }[] => {
    initTestTable();

    if (db.prepare("SELECT * FROM test").all().length === 0) {
      db.prepare("INSERT INTO test (name) VALUES (?)").run("John Doe");
    }

    const rows = db.prepare("SELECT * FROM test").all() as {
      id: number;
      name: string;
    }[];

    return rows;
  },
  saveName: (_: unknown, text: string): void => {
    initTestTable();
    db.prepare("INSERT INTO test (name) VALUES (?)").run(text);
  },
};
