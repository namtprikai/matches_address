import path from "path";
import { existsSync, mkdirSync } from "fs";
import Database from "better-sqlite3";

const dbDirectory = path.resolve("./database");
const dbPath =
  process.env.NODE_ENV === "development"
    ? path.join(dbDirectory, "database.db")
    : path.resolve(process.resourcesPath, "database.db");

if (!existsSync(dbDirectory)) {
  mkdirSync(dbDirectory, { recursive: true });
}

// eslint-disable-next-line no-console -- for debug
export const db = new Database(dbPath, { verbose: console.log });

// パフォーマンス向上のためWALモードを有効にする
// ref: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
db.pragma("journal_mode = WAL");
