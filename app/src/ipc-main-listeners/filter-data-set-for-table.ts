import { eq } from "drizzle-orm";
import { data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG } from "../config/data-columns";
import { columnsToSelectField } from "../utils/columns-to-select-field";
import { type TableProps } from "../@types/charts";
import { type IpcMainListener } from ".";

type FilterDataSetForTableResponse = TableProps;

export const filterDataSetForTable = ((_: unknown, { resultId, type, columns }: { resultId: number } & (
    { type: "building"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; } |
    { type: "area"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; })): FilterDataSetForTableResponse => {

    if (type === "building") {

        const all = db
            .select(columnsToSelectField({ type: "building", columns }))
            .from(data_set_detail_buildings)
            .where(eq(data_set_detail_buildings.data_set_result_id, resultId))
            .all();

        return {
            // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
            columns: columns.map(column => ({ key: column, label: DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].label })),
            data: all
        }
    }

    return {
        columns: [],
        data: []
    }

}) satisfies IpcMainListener