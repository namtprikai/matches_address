import { type ipcMain } from "electron";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { db, dbPath } from "./db";

const execFileAsync = promisify(execFile);

const binaryPath = (name: string): string => {
  const isDev = process.env.NODE_ENV === "development";
  const _binaryPath = path.resolve("binaries", name);
  return isDev ? _binaryPath : path.join(process.resourcesPath, _binaryPath);
};

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
  saveName: (_: unknown, name: string): void => {
    initTestTable();
    db.prepare<string>("INSERT INTO test (name) VALUES (?)").run(name);
  },
  helloFromPython: (_: unknown, name: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      execFile(binaryPath("hello"), [name], (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Stderr: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  },
  saveNameFromPython: async (_: unknown, name: string): Promise<void> => {
    await execFileAsync(binaryPath("save_name"), [name, dbPath]);
  },
} satisfies {
  [key: string]: Parameters<typeof ipcMain.handle>[1];
};

function initTestTable(): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
  );
}
