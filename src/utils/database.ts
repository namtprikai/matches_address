import path from "path";
import Database from "better-sqlite3";

const databasePath =
  process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, "database.db")
    : path.resolve(process.resourcesPath, "database.db");

// eslint-disable-next-line no-console -- for debug
export const database = new Database(databasePath, { verbose: console.log });
