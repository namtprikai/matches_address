import { type ipcMain } from "electron";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { getNames } from "./get-names";
import { saveName } from "./save-name";
import { helloFromPython } from "./hello-from-python";
import { saveNameFromPython } from "./save-name-from-python";
import { db } from "@/utils/db";

export const ipcMainListeners = {
  getNames,
  saveName,
  helloFromPython,
  saveNameFromPython,
};

export const execFileAsync = promisify(execFile);

export const binaryPath = (name: string): string => {
  const isDev = process.env.NODE_ENV === "development";
  const _binaryPath = path.resolve("binaries", name);
  return isDev ? _binaryPath : path.join(process.resourcesPath, _binaryPath);
};

export type IpcMainListener = Parameters<typeof ipcMain.handle>[1];

export function initTestTable(): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
  );
}
