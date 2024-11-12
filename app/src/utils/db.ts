import path from "path";
import { existsSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";

const isDev = process.env.NODE_ENV === "development";

export const dbDirectoryPath = (() => {
  const directoryName = "database";

  let result: string;
  if (isDev) {
    result = path.resolve(directoryName);
  } else {
    result = path.resolve(process.resourcesPath, directoryName);
  }

  return result;
})();

export const dbPath = (() => {
  const fileName = "database.db";

  const result = path.resolve(dbDirectoryPath, fileName);

  const directory = path.dirname(result);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  return result;
})();

const betterSqlite3 = new Database(dbPath);

// パフォーマンス向上のためWALモードを有効にする
// ref: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
betterSqlite3.pragma("journal_mode = WAL");

export const db: BetterSQLite3Database = drizzle(betterSqlite3);
