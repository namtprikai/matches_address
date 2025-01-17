import { and, eq, gte, lte, or, sql } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import {
  type GroupingCondition,
  type ChartProps,
  type FilterCondition,
} from "../@types/charts";
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
  groupingCalc?: "avg" | "sum" | "count";
  filterByYear: {
    startValue: string | undefined;
    endValue: string | undefined;
  };
  limit?: number;
  offset?: number;
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
    limit = 100,
    offset = 0,
  }: FilterDataSetForChartArgs,
): FilterDataSetForChartResponse => {
  // ページネーションのためにoffsetを調整する関数。現在総件数を超えたOffsetが指定された場合は、最終ページのOffsetに調整する。
  // できればクエリのインターフェースを、page, perPageとして、それらを元にoffsetを計算するようにしたい。
  const getAdjustedOffset = (
    totalCount: number,
    requestedOffset: number,
    pageLimit: number,
  ): number => {
    if (requestedOffset >= totalCount) {
      // Calculate the offset for the last page
      const lastPageOffset = Math.max(
        0,
        Math.floor((totalCount - 1) / pageLimit) * pageLimit,
      );
      return lastPageOffset;
    }
    return requestedOffset;
  };

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
          .all() as Record<`${string}_group`, string> &
          {
            [k in typeof y]: number;
          }[];
      }

      // Get total count first
      const totalCount = Number(
        db
          .select({ count: sql`count(*)` })
          .from(filterSubQuery)
          .where(eq(filterSubQuery.data_set_result_id, resultId))
          .get()?.count ?? 0,
      );

      // Adjust offset based on total count
      const adjustedOffset = getAdjustedOffset(totalCount, offset, limit);

      return db
        .select()
        .from(filterSubQuery)
        .where(eq(filterSubQuery.data_set_result_id, resultId))
        .limit(limit)
        .offset(adjustedOffset)
        .all();
    };
    const all = getAll();

    const columnYMetadata = AREA_DATASET_COLUMN_METADATA[y];
    const columnXMetadata = AREA_DATASET_COLUMN_METADATA[x];

    return {
      data: all.map((row) => {
        const xValue = (() => {
          if (`${x}_group` in row) {
            // @ts-expect-error drizzle側で型補完が効かないため、型を指定
            return row[`${x}_group`] as string;
          }
          return row[x] as string;
        })();
        const yValue = row[y] as number;
        return {
          x: xValue,
          y: yValue,
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
        // FIXME: 現状単位が%の場合は、groupingConditionsとして与えられる値も0-100の範囲になっている。
        // しかし、DBには0-1の範囲で保存されているため、どこかで単位が%のあたいかどうかを見て100で割る必要がある。
        // 一旦今は力技で、floatの場合かつ0-100の範囲の場合は100で割ることにしている。
        groupingConditions.forEach((condition) => {
          const isFloat = condition.referenceColumnType === "float";
          const isValueInZeroToOne =
            "value" in condition &&
            0 <= (condition.value as number) &&
            (condition.value as number) <= 100;
          const isStartValueAndLastValueInZeroToHundred =
            "startValue" in condition &&
            "lastValue" in condition &&
            0 <= (condition.startValue as number) &&
            (condition.lastValue as number) <= 100;
          if (isFloat && isValueInZeroToOne) {
            condition.value = (condition.value as number) / 100;
          }
          if (isFloat && isStartValueAndLastValueInZeroToHundred) {
            condition.startValue = (condition.startValue as number) / 100;
            condition.lastValue = (condition.lastValue as number) / 100;
          }
        });

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
            [x]: sql.raw(`${x}`),
            [y]: sql.raw(`${cal}(${y}) as ${y}`),
          })
          .from(subQuery.as("groups"))
          .groupBy(sql.raw(`${groupLabel}`))
          .having(sql.raw(`${groupLabel} <> ''`))
          .limit(limit)
          .all() as Record<`${string}_group`, string> &
          {
            [k in typeof y]: number;
          }[]; // drizzle側で型補完が効かないため、型を指定
      }

      // Get total count first
      const totalCount = Number(
        db
          .select({ count: sql`count(*)` })
          .from(filterSubQuery)
          .where(eq(filterSubQuery.data_set_result_id, resultId))
          .get()?.count ?? 0,
      );

      // Adjust offset based on total count
      const adjustedOffset = getAdjustedOffset(totalCount, offset, limit);

      return db
        .select()
        .from(filterSubQuery)
        .where(eq(filterSubQuery.data_set_result_id, resultId))
        .limit(limit)
        .offset(adjustedOffset)
        .all();
    };
    const all = getAll();

    const columnYMetadata = BUILDING_DATASET_COLUMN_METADATA[y];
    const columnXMetadata = BUILDING_DATASET_COLUMN_METADATA[x];

    return {
      data: all.map((row) => {
        const xValue = (() => {
          if (columnXMetadata.type === "float") {
            return row[x] as number;
          }
          return row[x] as string;
        })();
        const yValue = row[y] as number;

        return {
          x: xValue,
          y: yValue,
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
