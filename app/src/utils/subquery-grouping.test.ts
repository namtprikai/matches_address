import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeAll, describe, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { data_set_detail_buildings } from "../schema";
import { subQueryFromConditions } from "./subquery-grouping";

let dz: BetterSQLite3Database;
const count = 5;

beforeAll(async () => {
    const dbPath = ":memory:";
    // eslint-disable-next-line no-console -- for debug
    const db = new Database(dbPath, { verbose: console.log })
    dz = drizzle(db);
    await migrate(dz, { migrationsFolder: "drizzle" });

    for (let i = 0; i < count; i++) {
        dz.insert(data_set_detail_buildings).values({
            id: i,
            data_set_result_id: 1,
            reference_date: `2024-0${i + 1}-01`,
            depth: (i + 1) * 10,
            measuredheight: (i + 1) * 10,
        }).then().catch(console.error);
    }

})


describe("サブクエリを利用したグルーピングのテスト", () => {

    const key = "depth";
    const groupLabel = key + "_group";
    test("カラム単位の平均を取得する", () => {
        const subQuery = subQueryFromConditions(dz, data_set_detail_buildings, groupLabel, key, [
            { operation: "eq", value: 10, label: "eq10" },
            { operation: "noteq", value: 20, label: "noteq20" },
        ]);

        const res = dz.select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [key]: sql.raw(`avg(${key}) as ${key}`),
        })
            .from(subQuery.as("groups"))
            .groupBy(sql.raw(`${groupLabel}`))
            .having(sql.raw(`${groupLabel} <> ''`)).all();

        expect(res).toStrictEqual(
            [
                { depth_group: "eq10", depth: 10 },
                { depth_group: "noteq20", depth: 40 },
            ]
        )
    });


    test("カラム単位の合計を取得する", () => {

        const subQuery = subQueryFromConditions(dz, data_set_detail_buildings, groupLabel, key, [
            { operation: "eq", value: 10, label: "eq10" },
            { operation: "noteq", value: 20, label: "noteq20" },
        ]);

        const res = dz.select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [key]: sql.raw(`sum(${key}) as ${key}`),
        })
            .from(subQuery.as("groups"))
            .groupBy(sql.raw(`${groupLabel}`))
            .having(sql.raw(`${groupLabel} <> ''`)).all();

        expect(res).toStrictEqual(
            [
                { depth_group: "eq10", depth: 10 },
                { depth_group: "noteq20", depth: 120 },
            ]
        )
    });

    test("範囲条件でのカラム単位の平均を取得する", () => {

        const subQuery = subQueryFromConditions(dz, data_set_detail_buildings, groupLabel, key, [
            { operation: "range", startValue: 10, includesStart: true, lastValue: 30, includesLast: true, label: "10_to_30s" },
        ]);

        const res = dz.select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [key]: sql.raw(`avg(${key}) as ${key}`),
        })
            .from(subQuery.as("groups"))
            .groupBy(sql.raw(`${groupLabel}`))
            .having(sql.raw(`${groupLabel} <> ''`)).all();

        expect(res).toStrictEqual(
            [
                { depth_group: "10_to_30s", depth: 20 },
            ]
        )
    });
});