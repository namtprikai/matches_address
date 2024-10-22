import path from "path";
import { existsSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";

export const dbPath = (() => {
  const directoryName = "database";
  const fileName = "database.db";

  let result: string;
  if (process.env.NODE_ENV === "development") {
    result = path.resolve(directoryName, fileName);
  } else {
    result = path.resolve(process.resourcesPath, directoryName, fileName);
  }

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
