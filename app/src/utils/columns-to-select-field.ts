import { data_set_detail_areas, data_set_detail_buildings } from "../schema";

/**
 * 表形式スタイル表示用のカラム配列から, DrizzleのSelectField用の連想配列に変換する 
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type --  返り値が複雑なため型定義を省略
export const columnsToSelectField = ({ type, columns }: { type: "building"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[] } | { type: "area"; columns: (keyof typeof data_set_detail_areas.$inferSelect)[] }) => {
    if (type === "building") {
        return Object.fromEntries(columns.map(column => [column, data_set_detail_buildings[column]]));
    }

    if (type === "area") {
        return Object.fromEntries(columns.map(column => [column, data_set_detail_areas[column]]));
    }

    return {};
}