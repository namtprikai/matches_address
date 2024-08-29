import { type ChartColumnType } from "../@types/charts";
import { type data_set_detail_buildings } from "../schema";

/**
 * D902のカラム指定
 * ここで指定したカラムのみがパラメーターの選択肢として表示される
 */
export const DATA_SET_DETAIL_BUILIDNG_COLUMN = [
    "household_code",
    "normalized_address",
    'reference_date',
    "number_of_people_in_household",
    "number_of_people_under_15_years_old",
    "composition_ratio_of_people_under_15_years_old",
    "number_of_people_aged_15_to_64",
    "composition_ratio_of_people_aged_15_to_64",
    "number_of_people_aged_65_and_over",
    "composition_ratio_of_people_aged_65_and_over",
    "male_to_female_ratio",
    "period_of_residence",
    "water_number_suido_residence",
    "closing_flag_suido_residence",
    "maximum_water_usage_suido_residence",
    "average_water_usage_suido_residence",
    "total_water_usage_suido_residence",
    "minimum_water_usage_suido_residence",
    "name_source_information_suido_residence",
    "structure_name_touki_residence",
    "registration_date_touki_residence",
    "name_source_information_touki_residence",
    "id_akiya_result_cleaned",
    "address_akiya_result_cleaned",
    "measuredheight",
    "rank",
    "depth",
    "duration",
    "number_of_floors_above_ground",
    "number_of_basement_floors",
    "name",
    "pred",
    "pred_proba",
] satisfies (keyof typeof data_set_detail_buildings.$inferSelect)[]

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG = {
    household_code: {
        label: "世帯番号",
        type: "string",
        groupable: true,
    },
    normalized_address: {
        label: "住所",
        type: "string",
        groupable: true,
    },
    reference_date: {
        label: "基準日",
        type: "string",
        groupable: true,
    },
    number_of_people_in_household: {
        label: "世帯人数",
        type: "integer",
        groupable: true,
    },
    number_of_people_under_15_years_old: {
        label: "15歳未満の人数",
        type: "integer",
        groupable: true,
    },
    composition_ratio_of_people_under_15_years_old: {
        label: "15歳未満の人数比",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    number_of_people_aged_15_to_64: {
        label: "15歳以上64歳以下の人数",
        type: "integer",
        groupable: true,
    },
    composition_ratio_of_people_aged_15_to_64: {
        label: "15歳以上64歳以下の人数比",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    number_of_people_aged_65_and_over: {
        label: "65歳以上の人数",
        type: "integer",
        groupable: true,
    },
    composition_ratio_of_people_aged_65_and_over: {
        label: "65歳以上の人数比",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    male_to_female_ratio: {
        label: "男女比",
        type: "float",
        groupable: true,
    },
    period_of_residence: {
        label: "住定期間",
        type: "integer",
        groupable: true,
    },
    water_number_suido_residence: {
        label: "水道番号",
        type: "string",
        groupable: true,
    },
    closing_flag_suido_residence: {
        label: "閉栓フラグ",
        type: "integer",
        groupable: true,
    },
    maximum_water_usage_suido_residence: {
        label: "最大水道使用量",
        type: "float",
        groupable: true,
        unit: "m^3",
    },
    average_water_usage_suido_residence: {
        label: "平均水道使用量",
        type: "float",
        groupable: true,
        unit: "m^3",
    },
    total_water_usage_suido_residence: {
        label: "合計水道使用量",
        type: "float",
        groupable: true,
        unit: "m^3",
    },
    minimum_water_usage_suido_residence: {
        label: "最小水道使用量",
        type: "float",
        groupable: true,
        unit: "m^3",
    },
    name_source_information_suido_residence: {
        label: "情報源名",
        type: "string",
        groupable: true,
    },
    structure_name_touki_residence: {
        label: "構造名",
        type: "string",
        groupable: true,
    },
    registration_date_touki_residence: {
        label: "登録日",
        type: "string",
        groupable: true,
    },
    name_source_information_touki_residence: {
        label: "情報源名",
        type: "string",
        groupable: true,
    },
    id_akiya_result_cleaned: {
        label: "空き家ID",
        type: "integer",
        groupable: true,
    },
    address_akiya_result_cleaned: {
        label: "空き家住所",
        type: "string",
        groupable: true,
    },
    number_of_floors_above_ground: {
        label: "地上階数",
        type: "integer",
        groupable: true,
    },
    number_of_basement_floors: {
        label: "地下階数",
        type: "integer",
        groupable: true,
    },
    measuredheight: {
        label: "測定高度",
        type: "float",
        groupable: true,
        unit: "m",
    },
    rank: {
        label: "浸水ランク",
        type: "integer",
        groupable: true,
    },
    depth: {
        label: "浸水深",
        type: "float",
        groupable: true,
        unit: "m",
    },
    duration: {
        label: "浸水時間",
        type: "float",
        groupable: true,
        unit: "時間",
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
        percentage: true,
    },
} satisfies {
    [k in (typeof DATA_SET_DETAIL_BUILIDNG_COLUMN)[number]]?: {
        label: string;
        type: ChartColumnType;
        unit?: string;
        groupable?: boolean; // グルーピング可能かどうか
        percentage?: boolean; // パーセンテージ表示かどうか
    }
}