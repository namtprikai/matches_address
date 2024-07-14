import { type ipcMain } from "electron";
import { db } from "./db";

// ipcMain.handle()のハンドラ関数を定義する
export const ipcMainHandlers = {
  getNames: (): string[] => {
    initTestTable();

    if (db.prepare("SELECT * FROM test").all().length === 0) {
      db.prepare("INSERT INTO test (name) VALUES (?)").run("John Doe");
    }

    const rows = db
      .prepare<[], { id: number; name: string }>("SELECT * FROM test")
      .all();
    const names = rows.map((row) => row.name);

    return names;
  },
  saveName: (_: unknown, text: string): void => {
    initTestTable();
    db.prepare<string>("INSERT INTO test (name) VALUES (?)").run(text);
  },
} satisfies {
  [key: string]: Parameters<typeof ipcMain.handle>[1];
};

function initTestTable(): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
  );
}
