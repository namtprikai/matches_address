import { type SQL, sql } from "drizzle-orm";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";

type Condition = {
    operation: "eq" | "noteq",
    value: string | number,
    label: string
}

const conditionsToCaseQuery = (key: string, conditions: Condition[
]): SQL => {

    const conditionSQL: SQL[] = conditions.map((condition) => { return sql.raw(`when ${key} ${condition.operation === "eq" ? "=" : "<>"} ${condition.value} then '${condition.label}'`) })

    return sql`case ${sql.join(conditionSQL, sql.raw(" "))} end`;
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

        ).toStrictEqual(sqliteDialect.sqlToQuery(sql`case when age = 1 then 'a' when age <> 2 then 'b' end`))
    })
}