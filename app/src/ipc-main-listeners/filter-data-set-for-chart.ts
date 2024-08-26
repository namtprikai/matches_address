import { eq } from "drizzle-orm";
import {
    data_set_detail_areas,
    data_set_detail_buildings,
} from "../schema";
import { db } from "../utils/db";
import { type ChartProps } from "../@types/charts";
import { DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG } from "../config/data-columns";
import { type IpcMainListener } from ".";

export type FilterDataSetForChartResponse = ChartProps;

export const filterDataSetForChart = ((
    _: unknown,
    { resultId, type, x, y }: { resultId: number } & (
        { type: "building"; x: keyof typeof data_set_detail_buildings.$inferSelect; y: keyof typeof data_set_detail_buildings.$inferSelect } |
        { type: "area"; x: keyof typeof data_set_detail_areas.$inferSelect; y: keyof typeof data_set_detail_areas.$inferSelect }
    ),
): FilterDataSetForChartResponse => {
    if (type === "area") {
        const all = db
            .select()
            .from(data_set_detail_areas)
            .where(eq(data_set_detail_areas.data_set_result_id, resultId))
            .all();

        return {
            data: all.map((row: typeof data_set_detail_areas.$inferSelect) => {
                return {
                    x: row[x] as string,
                    y: row[y] as number, // TODO: この辺りの型定義は別途修正が必要
                }
            }),
            xAxisColumn: {
                type: "string", // TODO: この辺りの型定義は別途修正が必要
            },
            yAxisColumn: {
                type: "number", // TODO: この辺りの型定義は別途修正が必要
            },
        };
    }
    if (type === "building") {
        const all = db
            .select()
            .from(data_set_detail_buildings)
            .where(eq(data_set_detail_buildings.data_set_result_id, resultId))
            .all();

        return {
            data: all.map((row: typeof data_set_detail_buildings.$inferSelect) => {
                return {
                    x: row[x] as string,
                    y: row[y] as number,
                }
            }),
            xAxisColumn: {
                type: "string",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[x].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[x].label,
            },
            yAxisColumn: {
                type: "number",
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                unit: DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[y].unit,
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                label: DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[y].label,
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
    }

}) satisfies IpcMainListener;
