import Database from "better-sqlite3";
import { type SQL, sql, type Subquery } from "drizzle-orm";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import {
  SQLiteSyncDialect,
  type SQLiteTable,
  type SQLiteTableWithColumns,
} from "drizzle-orm/sqlite-core";
import { type SQLiteViewBase } from "drizzle-orm/sqlite-core/view-base";
import { data_set_detail_buildings } from "../schema";
import { type GroupingCondition } from "../@types/charts";

const operationToQuery = (
  operation: GroupingCondition["operation"],
): string => {
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
    case "contains":
      return "like";
    case "notContains":
      return "not like";
    default:
      return "";
  }
};

const conditionsToCaseQuery = (
  key: string,
  conditions: GroupingCondition[],
): SQL => {
  const conditionSQL: SQL[] = conditions.map((condition) => {
    if (condition.operation === "range") {
      if (
        condition.startValue === undefined &&
        condition.lastValue === undefined
      ) {
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

      return sql.raw(
        `when ${startQuery} and ${lastQuery} then '${condition.label}'`,
      );
    }

    const value =
      typeof condition.value === "number"
        ? condition.value
        : `'${condition.operation === "contains" || condition.operation === "notContains" ? `%${condition.value}%` : condition.value}'`;

    return sql.raw(
      `when ${key} ${operationToQuery(condition.operation)} ${value} then '${condition.label}'`,
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
          {
            operation: "eq",
            value: 1,
            label: "a",
            referenceColumnType: "integer",
          },
          {
            operation: "noteq",
            value: 2,
            label: "b",
            referenceColumnType: "integer",
          },
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
            referenceColumnType: "integer",
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
          {
            operation: "gte",
            value: 1,
            label: "a",
            referenceColumnType: "integer",
          },
        ]),
      ),
    ).toStrictEqual(
      sqliteDialect.sqlToQuery(sql`*, case when age >= 1 then 'a' end`),
    );
  });

  it("以下のcaseクエリを作成する", () => {
    expect(
      sqliteDialect.sqlToQuery(
        conditionsToCaseQuery("age", [
          {
            operation: "lte",
            value: 1,
            label: "a",
            referenceColumnType: "integer",
          },
        ]),
      ),
    ).toStrictEqual(
      sqliteDialect.sqlToQuery(sql`*, case when age <= 1 then 'a' end`),
    );
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
export const subQueryFromConditions = (
  drizzle: BetterSQLite3Database,
  db: SQLiteTable | Subquery | SQLiteViewBase | SQL,
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
        {
          operation: "eq",
          value: 1,
          label: "a",
          referenceColumnType: "integer",
        },
        {
          operation: "noteq",
          value: 2,
          label: "b",
          referenceColumnType: "integer",
        },
      ],
    );

    expect(subquery.toSQL()).toStrictEqual({
      sql: "select *, case when age = 1 then 'a' when age <> 2 then 'b' end as group from \"data_set_detail_buildings\"",
      params: [],
    });
  });

  it("テキストを対象としたサブクエリを作成する", async () => {
    const dbPath = ":memory:";
    // eslint-disable-next-line no-console -- for debug
    const db = new Database(dbPath, { verbose: console.log });
    const dz = drizzle(db);
    await migrate(dz, { migrationsFolder: "drizzle" });

    const subquery = subQueryFromConditions(
      dz,
      data_set_detail_buildings,
      "group",
      "name",
      [
        {
          operation: "contains",
          value: "秋葉町",
          label: "秋葉町",
          referenceColumnType: "text",
        },
        {
          operation: "notContains",
          value: "秋葉町",
          label: "No秋葉町",
          referenceColumnType: "text",
        },
      ],
    );

    expect(subquery.toSQL()).toStrictEqual({
      sql: "select *, case when name like '秋葉町' then '秋葉町' when name not like '秋葉町' then 'No秋葉町' end as group from \"data_set_detail_buildings\"",
      params: [],
    });
  });
}
