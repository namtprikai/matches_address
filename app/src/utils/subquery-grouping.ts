import Database from "better-sqlite3";
import { type Query, type SQL, sql, type Subquery } from "drizzle-orm";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type SubqueryWithSelection } from "drizzle-orm/pg-core";
import { type SQLiteSelect, type SQLiteSelectBase, SQLiteSyncDialect, type SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { data_set_detail_buildings } from "../schema";

type Condition = {
    operation: "eq" | "noteq",
    value: string | number,
    label: string
}

const conditionsToCaseQuery = (key: string, conditions: Condition[
]): SQL => {

    const conditionSQL: SQL[] = conditions.map((condition) => { return sql.raw(`when ${key} ${condition.operation === "eq" ? "=" : "<>"} ${condition.value} then '${condition.label}'`) })

    return sql`*, case ${sql.join(conditionSQL, sql.raw(" "))} end`;
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest
    const sqliteDialect = new SQLiteSyncDialect();
    it('eq, noteqベースの条件からcaseクエリを作成する', () => {
        expect(
            sqliteDialect.sqlToQuery(conditionsToCaseQuery(
                "age",
                [
                    { operation: "eq", value: 1, label: "a" },
                    { operation: "noteq", value: 2, label: "b" },
                ]
            ))

        ).toStrictEqual(sqliteDialect.sqlToQuery(sql`*, case when age = 1 then 'a' when age <> 2 then 'b' end`))
    })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
const subQueryFromConditions = <T extends SQLiteTableWithColumns<any>>(drizzle: BetterSQLite3Database, db: T, groupLabel: string, key: string, conditions: Condition[]) => {
    const caseQuery = conditionsToCaseQuery(key, conditions);

    const subQuery = drizzle.select({
        [groupLabel]: sql.join([caseQuery, sql.raw(`as ${groupLabel}`)], sql.raw(" ")),
    }).from(db)

    return subQuery;
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest

    it("条件からサブクエリを作成する", async () => {
        const dbPath = ":memory:";
        // eslint-disable-next-line no-console -- for debug
        const db = new Database(dbPath, { verbose: console.log })
        const dz = drizzle(db);
        await migrate(dz, { migrationsFolder: "drizzle" });

        const subquery =
            subQueryFromConditions(
                dz,
                data_set_detail_buildings,
                "group",
                "age",
                [
                    { operation: "eq", value: 1, label: "a" },
                    { operation: "noteq", value: 2, label: "b" },
                ]
            )

        expect(
            subquery.toSQL()
        ).toStrictEqual(
            {
                sql: "select *, case when age = 1 then 'a' when age <> 2 then 'b' end as group from \"data_set_detail_buildings\"",
                params: [],
            }
        )
    })
}

export const subqueryGrouping = <T extends SQLiteTableWithColumns<any>>(drizzle: BetterSQLite3Database, db: T, groupLabel: string, key: string, conditions: Condition[]) => {
    const subQuery = subQueryFromConditions(drizzle, db, groupLabel, key, conditions);

    const query = drizzle.select({
        [groupLabel]: sql.raw(`${groupLabel}`),
        [key]: sql.raw(`avg(${key}) as ${key}`),
    }).from(subQuery.as("groups")).groupBy(sql.raw(`${groupLabel}`)).having(sql.raw(`${groupLabel} <> ''`));

    console.log(query.toSQL())


    return query.all();
}