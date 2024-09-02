import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterAll, beforeAll, describe, test } from "vitest";
import { data_set_detail_buildings } from "../schema";

let dz: BetterSQLite3Database;

beforeAll(async () => {
    const dbPath = ":memory:";
    // eslint-disable-next-line no-console -- for debug
    const db = new Database(dbPath, { verbose: console.log })
    dz = drizzle(db);
    await migrate(dz, { migrationsFolder: "drizzle" });
})

describe("サブクエリを利用したグルーピングのテスト", () => {
    test("サブクエリの実行", () => {
    });
});