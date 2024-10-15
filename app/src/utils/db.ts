import { app } from "electron";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";

const isDev = process.env.NODE_ENV === "development";
const dbDirectory = path.resolve("./database");
export const dbPath = isDev
  ? path.join(dbDirectory, "database.db")
  : path.join(app.getPath("appData"), "database.db");

if (isDev && !existsSync(dbDirectory)) {
  mkdirSync(dbDirectory, { recursive: true });
}

const betterSqlite3 = new Database(dbPath);

// パフォーマンス向上のためWALモードを有効にする
// ref: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
betterSqlite3.pragma("journal_mode = WAL");

export const db: BetterSQLite3Database = drizzle(betterSqlite3);
