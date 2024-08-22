import { type ChartColumnType } from "../@types/charts";
import { type data_set_detail_buildings } from "../schema";

/**
 * D902のカラム指定
 * ここで指定したカラムのみがパラメーターの選択肢として表示される
 */
export const DATA_SET_DETAIL_BUILIDNG_COLUMN = [
    "id",
    "data_set_result_id",
    "name",
    "pred",
    "pred_proba",
    "composition_ratio_of_people_aged_15_to_64",
    "composition_ratio_of_people_aged_65_and_over",
    "composition_ratio_of_people_under_15_years_old",
    "household_code",
    "duration",
    "depth",
    "rank",
    "measuredheight",
    "geometry",
    "created_at",
    "updated_at",
    "buildingdisasterriskattribute_buildingriverfloodingriskattribute_rank",
    "buildingdisasterriskattribute_buildingriverfloodingriskattribute_description",
] satisfies (keyof typeof data_set_detail_buildings.$inferSelect)[]

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG = {
    id: {
        label: "ID",
        type: "string",
        groupable: false,
    },
    data_set_result_id: {
        label: "データセットID",
        type: "string",
        groupable: false,
    },
    name: {
        label: "名前",
        type: "string",
        groupable: true,
    },
    pred: {
        label: "空き家判定",
        type: "integer",
        groupable: true,
    },
    pred_proba: {
        label: "空き家確率",
        type: "float",
        groupable: true,
        unit: "%",
    },
    composition_ratio_of_people_aged_15_to_64: {
        label: "15歳以上64歳以下の世帯に対する人数比",
        type: "float",
        groupable: true,
        unit: "%",
    },
    composition_ratio_of_people_aged_65_and_over: {
        label: "65歳以上の世帯に対する人数比",
        type: "float",
        groupable: true,
        unit: "%",
    },
    composition_ratio_of_people_under_15_years_old: {
        label: "15歳未満の世帯に対する人数比",
        type: "float",
        groupable: true,
        unit: "%",
    },
    household_code: {
        label: "世帯番号",
        type: "string",
        groupable: true,
    },
    duration: {
        label: "浸水時間",
        type: "float",
        groupable: true,
        unit: "時間",
    },
    depth: {
        label: "浸水深",
        type: "float",
        groupable: true,
        unit: "m",
    },
    rank: {
        label: "浸水ランク",
        type: "integer",
        groupable: true,
    },
    measuredheight: {
        label: "測定高度",
        type: "float",
        groupable: true,
        unit: "m",
    },
    geometry: {
        label: "ジオメトリ",
        type: "string",
        groupable: false,
        excludeChart: true,
    },
    created_at: {
        label: "作成日時",
        type: "date",
        groupable: false,
    },
    updated_at: {
        label: "更新日時",
        type: "date",
        groupable: false,
    },
    buildingdisasterriskattribute_buildingriverfloodingriskattribute_rank: {
        label: "洪水氾濫リスク属性_ランク",
        type: "integer",
        groupable: true,
    },
    buildingdisasterriskattribute_buildingriverfloodingriskattribute_description: {
        label: "洪水氾濫リスク属性_建物",
        type: "string",
        groupable: true,
    },
} satisfies {
    [k in (typeof DATA_SET_DETAIL_BUILIDNG_COLUMN)[number]]?: {
        label: string;
        type: ChartColumnType;
        unit?: string;
        groupable?: boolean; // グルーピング可能かどうか
        excludeChart?: true; // チャート表示対象外かどうか
    }
}