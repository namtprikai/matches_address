import { and, eq, gte, lte, sql } from "drizzle-orm";
import {
    data_set_detail_areas,
    data_set_detail_buildings,
    result_views,
    type SelectDataSetDetailArea,
    type SelectDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import { type Parameter, type ChartProps } from "../@types/charts";
import {
    DATA_SET_DETAIL_AREA_COLUMN_CONFIG,
    DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG,
} from "../config/column-list";
import { formatChartValue } from "../utils/format-chart-value";
import { subQueryFromConditions, type GroupingCondition } from "../utils/subquery-grouping";
import { type IpcMainListener } from ".";

export type FilterDataSetForChartResponse = ChartProps;

export const filterDataSetForChart = ((
    _: unknown,
    {
        resultId,
        type,
        x,
        y,
        groupingConditions,
        filterByYear
    }: {
        resultId: number, groupingConditions?: GroupingCondition[], filterByYear: {
            startValue: number | undefined;
            endValue: number | undefined;
        }
    } & (
            | {
                type: "building";
                x: keyof SelectDataSetDetailBuilding;
                y: keyof SelectDataSetDetailBuilding;
            }
            | {
                type: "area";
                x: keyof SelectDataSetDetailArea;
                y: keyof SelectDataSetDetailArea;
            }
        ),
): FilterDataSetForChartResponse => {

    if (type === "area") {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
        const getAll = () => {

            const filterSubQuery = db.select().from(data_set_detail_areas).where(
                and(
                    eq(data_set_detail_areas.data_set_result_id, resultId),
                    filterByYear.startValue ? gte(data_set_detail_areas.reference_date, `${filterByYear.startValue}-01-01`) : undefined,
                    filterByYear.endValue ? lte(data_set_detail_areas.reference_date, `${filterByYear.endValue}-01-01`) : undefined,
                )
            ).as("filterSubQuery");

            if (groupingConditions && groupingConditions.length > 0) {
                const groupLabel = x + "_group";

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
                        [y]: sql.raw(`avg(${y}) as ${y}`),
                    })
                    .from(subQuery.as("groups"))
                    .groupBy(sql.raw(`${groupLabel}`))
                    .having(sql.raw(`${groupLabel} <> ''`))
                    .limit(100).all();
            }

            return db
                .select()
                .from(filterSubQuery)
                .where(eq(filterSubQuery.data_set_result_id, resultId))
                .limit(100).all();
        }
        const all = getAll();
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        const percentage = DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].percentage;

        return {
            data: all.map((row) => {
                return {
                    x: groupingConditions ? row[x + "_group"] as string : row[x] as string,
                    // TODO: この辺りの型定義は別途修正が必要
                    y: formatChartValue(row[y] ?? "", percentage) as number,
                };
            }),
            xAxisColumn: {
                type: "string",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[x].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[x].label,
            },
            yAxisColumn: {
                type: "number",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].label,
            },
        };
    }
    if (type === "building") {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- ignore
        const getAll = () => {

            const filterSubQuery = db.select().from(data_set_detail_buildings).where(
                and(
                    eq(data_set_detail_buildings.data_set_result_id, resultId),
                    filterByYear.startValue ? gte(data_set_detail_buildings.reference_date, `${filterByYear.startValue}-01-01`) : undefined,
                    filterByYear.endValue ? lte(data_set_detail_buildings.reference_date, `${filterByYear.endValue}-01-01`) : undefined,
                )
            ).as("filterSubQuery");

            if (groupingConditions && groupingConditions.length > 0) {
                const groupLabel = x + "_group";

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
                        [y]: sql.raw(`avg(${y}) as ${y}`),
                    })
                    .from(subQuery.as("groups"))
                    .groupBy(sql.raw(`${groupLabel}`))
                    .having(sql.raw(`${groupLabel} <> ''`))
                    .limit(100).all();
            }

            return db
                .select()
                .from(filterSubQuery)
                .where(eq(filterSubQuery.data_set_result_id, resultId))
                .limit(100).all();
        }
        const all = getAll();

        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        const percentage = DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].percentage;

        return {
            data: all.map((row) => {
                return {
                    x: (groupingConditions && groupingConditions.length > 0) ? row[x + "_group"] as string : row[x] as string,
                    // TODO: この辺りの型定義は別途修正が必要
                    y: formatChartValue(row[y] ?? "", percentage) as number,
                };
            }),
            xAxisColumn: {
                type: "string",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[x].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[x].label,
            },
            yAxisColumn: {
                type: "number",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].label,
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
