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

export type GroupingCondition =
    | {
        operation: "eq" | "noteq" | "gt" | "lt" | "gte" | "lte";
        value: number | undefined;
        label: string;
    }
    | ({
        operation: "range";
        label: string;
        startValue: number | undefined;
        includesStart: boolean | undefined;
        lastValue: number | undefined;
        includesLast: boolean | undefined;
    })

const operationToQuery = (operation: GroupingCondition["operation"]): string => {
    switch (operation) {
        case "eq":
            return "=";
        case "noteq":
            return "<>";
        case "gt":
            return ">";
        case "lt":
            return "<";
        case "gte":
            return ">=";
        case "lte":
            return "<=";
        default:
            return "";
    }
}

const conditionsToCaseQuery = (key: string, conditions: GroupingCondition[]): SQL => {
    const conditionSQL: SQL[] = conditions.map((condition) => {

        if (condition.operation === "range") {
            if (condition.startValue === undefined && condition.lastValue === undefined) {
                return sql.raw("");
            }

            const startValue = condition.startValue;
            const lastValue = condition.lastValue;
            const includesStart = condition.includesStart;
            const includesLast = condition.includesLast;

            // 開始値の条件クエリを作成
            const startQuery = `${key} ${includesStart === true ? ">=" : ">"} ${startValue}`;
            // 終了値の条件クエリを作成
            const lastQuery = `${key} ${includesLast === true ? "<=" : "<"} ${lastValue}`;

            return sql.raw(`when ${startQuery} and ${lastQuery} then '${condition.label}'`);
        }

        return sql.raw(
            `when ${key} ${operationToQuery(condition.operation)} ${condition.value} then '${condition.label}'`,
        );
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

    it("範囲条件のcaseクエリを作成する", () => {
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

    it("以上のcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    { operation: "gte", value: 1, label: "a" },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age >= 1 then 'a' end`,
            ),
        );
    });

    it("以下のcaseクエリを作成する", () => {
        expect(
            sqliteDialect.sqlToQuery(
                conditionsToCaseQuery("age", [
                    { operation: "lte", value: 1, label: "a" },
                ]),
            ),
        ).toStrictEqual(
            sqliteDialect.sqlToQuery(
                sql`*, case when age <= 1 then 'a' end`,
            ),
        );
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const subQueryFromConditions = <T extends SQLiteTableWithColumns<any>>(
    drizzle: BetterSQLite3Database,
    db: T,
    groupLabel: string,
    key: string,
    conditions: GroupingCondition[],
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