import Database from "better-sqlite3";
import { type SQL, sql } from "drizzle-orm";
import {
    drizzle,
    type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import {
    SQLiteSyncDialect,
    type SQLiteTableWithColumns,
} from "drizzle-orm/sqlite-core";
import { data_set_detail_buildings } from "../schema";

type Condition =
    | {
        operation: "eq" | "noteq";
        value: string | number;
        label: string;
    }
    | ({
        operation: "range";
        label: string;
        startValue?: number;
        includesStart?: boolean;
        lastValue?: number;
        includesLast?: boolean;
    })

type CalcOption = "sum" | "avg";

const conditionsToCaseQuery = (key: string, conditions: Condition[]): SQL => {
    const conditionSQL: SQL[] = conditions.map((condition) => {


        if (condition.operation === "eq" || condition.operation === "noteq") {
            return sql.raw(
                `when ${key} ${condition.operation === "eq" ? "=" : "<>"} ${condition.value} then '${condition.label}'`,
            );
        }

        if (condition.operation === "range") {

            if (condition.startValue === undefined && condition.lastValue === undefined) {
                return sql.raw("");
            }

            const startValue = condition.startValue;
            const lastValue = condition.lastValue;
            const includesStart = condition.includesStart;
            const includesLast = condition.includesLast;

            const startQuery = startValue === undefined ? "" : `${key} ${includesStart === true ? ">=" : ">"} ${startValue}`;
            const lastQuery = lastValue === undefined ? "" : `${key} ${includesLast === true ? "<=" : "<"} ${lastValue}`;

            if (startQuery && !lastQuery) {
                return sql.raw(`when ${lastQuery} then '${condition.label}'`);
            } else if (lastQuery && !startQuery) {
                return sql.raw(`when ${startQuery} then '${condition.label}'`);
            }
            return sql.raw(`when ${lastQuery
                } then '${condition.label}'`);
        }

        return sql.raw("");

    });

    return sql`*, case ${sql.join(conditionSQL, sql.raw(" "))} end`;
};

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;
    const sqliteDialect = new SQLiteSyncDialect();
    it("eq, noteqベースの条件からcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    { operation: "eq", value: 1, label: "a" },
                    { operation: "noteq", value: 2, label: "b" },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age = 1 then 'a' when age <> 2 then 'b' end`,
            ),
        );
    });

    it("範囲条件で開始値、終了値どちらも含むcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    {
                        operation: "range",
                        label: "a",
                        startValue: 1,
                        includesStart: true,
                        lastValue: 10,
                        includesLast: false,
                    },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age >= 1 and age < 10 then 'a' end`,
            ),
        );
    });

    it("範囲条件で開始値のみ含むcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    {
                        operation: "range",
                        label: "a",
                        startValue: 1,
                        includesStart: true
                    },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age >= 1 then 'a' end`,
            ),
        );
    });

    it("範囲条件で終了値のみ含むcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    {
                        operation: "range",
                        label: "a",
                        lastValue: 10,
                        includesLast: false,
                    },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age < 10 then 'a' end`,
            ),
        );
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
const subQueryFromConditions = <T extends SQLiteTableWithColumns<any>>(
    drizzle: BetterSQLite3Database,
    db: T,
    groupLabel: string,
    key: string,
    conditions: Condition[],
) => {
    const caseQuery = conditionsToCaseQuery(key, conditions);

    const subQuery = drizzle
        .select({
            [groupLabel]: sql.join(
                [caseQuery, sql.raw(`as ${groupLabel}`)],
                sql.raw(" "),
            ),
        })
        .from(db);

    return subQuery;
};

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it("条件からサブクエリを作成する", async () => {
        const dbPath = ":memory:";
        // eslint-disable-next-line no-console -- for debug
        const db = new Database(dbPath, { verbose: console.log });
        const dz = drizzle(db);
        await migrate(dz, { migrationsFolder: "drizzle" });

        const subquery = subQueryFromConditions(
            dz,
            data_set_detail_buildings,
            "group",
            "age",
            [
                { operation: "eq", value: 1, label: "a" },
                { operation: "noteq", value: 2, label: "b" },
            ],
        );

        expect(subquery.toSQL()).toStrictEqual({
            sql: "select *, case when age = 1 then 'a' when age <> 2 then 'b' end as group from \"data_set_detail_buildings\"",
            params: [],
        });
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const subqueryGrouping = <T extends SQLiteTableWithColumns<any>>(
    drizzle: BetterSQLite3Database,
    db: T,
    groupLabel: string,
    key: string,
    conditions: Condition[],
    calc: CalcOption = "avg",
) => {
    const subQuery = subQueryFromConditions(
        drizzle,
        db,
        groupLabel,
        key,
        conditions,
    );

    const query = drizzle
        .select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [key]: sql.raw(`${calc}(${key}) as ${key}`),
        })
        .from(subQuery.as("groups"))
        .groupBy(sql.raw(`${groupLabel}`))
        .having(sql.raw(`${groupLabel} <> ''`));

    return query.all();
};
