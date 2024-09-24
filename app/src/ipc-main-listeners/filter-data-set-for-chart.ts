import { and, eq, gte, lte, or, sql } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import {
  type GroupingCondition,
  type ChartProps,
  type FilterCondition,
} from "../@types/charts";
import { formatChartValue } from "../utils/format-chart-value";
import { subQueryFromConditions } from "../utils/subquery-grouping";
import {
  type AREA_DATASET_COLUMN,
  AREA_DATASET_COLUMN_METADATA,
  type BUILDING_DATASET_COLUMN,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../config/column-metadata";
import { FilterQuery } from "../utils/filter-query";
import { type IpcMainListener } from ".";

export type FilterDataSetForChartResponse = ChartProps;
export type FilterDataSetForChartArgs = {
  resultId: number;
  groupingConditions?: GroupingCondition[];
  filterConditions?: FilterCondition[];
  filterByAreas?: string[];
  groupingCalc?: "avg" | "sum";
  filterByYear: {
    startValue: string | undefined;
    endValue: string | undefined;
  };
} & (
  | {
      type: "building";
      x: BUILDING_DATASET_COLUMN;
      y: BUILDING_DATASET_COLUMN;
    }
  | {
      type: "area";
      x: AREA_DATASET_COLUMN;
      y: AREA_DATASET_COLUMN;
    }
);

// TODO: 非同期処理に変更する
export const filterDataSetForChart = ((
  _: unknown,
  {
    resultId,
    type,
    x,
    y,
    groupingConditions,
    filterConditions,
    filterByYear,
    filterByAreas,
    groupingCalc: cal = "avg",
  }: FilterDataSetForChartArgs,
): FilterDataSetForChartResponse => {
  if (type === "area") {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
    const getAll = () => {
      const filterSubQuery = db
        .select()
        .from(data_set_detail_areas)
        .where(
          and(
            eq(data_set_detail_areas.data_set_result_id, resultId),
            filterByYear.startValue
              ? gte(
                  data_set_detail_areas.reference_date,
                  `${filterByYear.startValue}-01-01`,
                )
              : undefined,
            filterByYear.endValue
              ? lte(
                  data_set_detail_areas.reference_date,
                  `${filterByYear.endValue}-12-31`,
                )
              : undefined,
            ...FilterQuery({
              conditions: filterConditions ?? [],
            }),
            or(
              // 地域区分文字列のリストからeq条件を作成
              ...(filterByAreas ?? []).map((area) =>
                eq(data_set_detail_areas.area_group, area),
              ),
            ),
          ),
        )
        .as("filterSubQuery");

      if (groupingConditions && groupingConditions.length > 0) {
        const groupLabel = `${x}_group` as const;

        const subQuery = subQueryFromConditions(
          db,
          filterSubQuery,
          groupLabel,
          x,
          groupingConditions,
        );

        return db
          .select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [y]: sql.raw(`${cal}(${y}) as ${y}`),
          })
          .from(subQuery.as("groups"))
          .groupBy(sql.raw(`${groupLabel}`))
          .having(sql.raw(`${groupLabel} <> ''`))
          .limit(100)
          .all() as {
          [key: `${string}_group`]: string;
        } & {
          [k in typeof y]: number;
        }[];
      }

      return db
        .select()
        .from(filterSubQuery)
        .where(eq(filterSubQuery.data_set_result_id, resultId))
        .limit(100)
        .all();
    };
    const all = getAll();

    const columnYMetadata = AREA_DATASET_COLUMN_METADATA[y];
    const columnXMetadata = AREA_DATASET_COLUMN_METADATA[x];

    return {
      data: all.map((row) => {
        if (`${x}_group` in row) {
          return {
            // @ts-expect-error drizzle側で型補完が効かないため、型を指定
            x: row[`${x}_group`] as string,
            y: formatChartValue(row[y] as number) as number,
          };
        }

        return {
          x: row[x] as string,
          y: formatChartValue(row[y] as number) as number,
        };
      }),
      xAxisColumn: {
        type: "string",
        unit: columnXMetadata.unit,
        label: columnXMetadata.label,
      },
      yAxisColumn: {
        type: "number",
        unit: columnYMetadata.unit,
        label: columnYMetadata.label,
      },
    };
  }
  if (type === "building") {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
    const getAll = () => {
      const filterSubQuery = db
        .select()
        .from(data_set_detail_buildings)
        .where(
          and(
            eq(data_set_detail_buildings.data_set_result_id, resultId),
            filterByYear.startValue
              ? gte(
                  data_set_detail_buildings.reference_date,
                  `${filterByYear.startValue}-01-01`,
                )
              : undefined,
            filterByYear.endValue
              ? lte(
                  data_set_detail_buildings.reference_date,
                  `${filterByYear.endValue}-12-31`,
                )
              : undefined,
            ...FilterQuery({
              conditions: filterConditions ?? [],
            }),
            or(
              // 地域区分文字列のリストからeq条件を作成
              ...(filterByAreas ?? []).map((area) =>
                eq(data_set_detail_buildings.area_group, area),
              ),
            ),
          ),
        )
        .as("filterSubQuery");

      if (groupingConditions && groupingConditions.length > 0) {
        const groupLabel = `${x}_group` as const;

        const subQuery = subQueryFromConditions(
          db,
          filterSubQuery,
          groupLabel,
          x,
          groupingConditions,
        );

        return db
          .select({
            [groupLabel]: sql.raw(`${groupLabel}`),
            [y]: sql.raw(`${cal}(${y}) as ${y}`),
          })
          .from(subQuery.as("groups"))
          .groupBy(sql.raw(`${groupLabel}`))
          .having(sql.raw(`${groupLabel} <> ''`))
          .limit(100)
          .all() as {
          [key: `${string}_group`]: string;
        } & {
          [k in typeof y]: number;
        }[]; // drizzle側で型補完が効かないため、型を指定
      }

      return db
        .select()
        .from(filterSubQuery)
        .where(eq(filterSubQuery.data_set_result_id, resultId))
        .limit(100)
        .all();
    };
    const all = getAll();

    const columnYMetadata = BUILDING_DATASET_COLUMN_METADATA[y];
    const columnXMetadata = BUILDING_DATASET_COLUMN_METADATA[x];

    return {
      data: all.map((row) => {
        if (`${x}_group` in row) {
          return {
            // @ts-expect-error drizzle側で型補完が効かないため、型を指定
            x: row[`${x}_group`],
            y: formatChartValue(row[y] ?? "") as number,
          };
        }

        return {
          x: row[x] as string,
          y: formatChartValue(row[y] ?? "") as number,
        };
      }),
      xAxisColumn: {
        type: "string",
        unit: columnXMetadata.unit,
        label: columnXMetadata.label,
      },
      yAxisColumn: {
        type: "number",
        unit: columnYMetadata.unit,
        label: columnYMetadata.label,
      },
    };
  }

  return {
    data: [],
    xAxisColumn: {
      type: "string",
    },
    yAxisColumn: {
      type: "number",
    },
  };
}) satisfies IpcMainListener;
