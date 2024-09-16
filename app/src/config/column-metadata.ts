
/**
 * D903のカラム指定
 * ここで指定したカラムのみがパラメーターの選択肢として表示される
 */
import { type ChartColumnType } from "../@types/charts";

import { type SelectDataSetDetailBuilding, type SelectDataSetDetailArea } from "../schema";


type AREA_DATASET_COLUMN = keyof SelectDataSetDetailArea;
type BUILDING_DATASET_COLUMN = keyof SelectDataSetDetailBuilding;

type ColumnMetadata<COLUMN> = {
    [k in keyof COLUMN]?: {
        label: string;
        type: ChartColumnType;
        unit?: string;
        groupable?: boolean; // グルーピング可能かどうか
        percentage?: boolean; // パーセンテージ表示かどうか
    };
};

/**
 * D903のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const AREA_DATASET_COLUMN_METADATA = {
    reference_date: {
        label: "基準日",
        type: "string",
        groupable: true,
    },
    address: {
        label: "住所",
        type: "string",
        groupable: true,
    },
    young_population_ratio: {
        label: "若年層率",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    elderly_population_ratio: {
        label: "高齢者率",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    total_building_count: {
        label: "建物数",
        type: "integer",
        groupable: true,
    },
    predicted_probability: {
        label: "空き家率",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    area: {
        label: "面積",
        type: "float",
        groupable: true,
        unit: "m^2",
    },
} satisfies ColumnMetadata<AREA_DATASET_COLUMN>;

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const BUILDING_DATASET_COLUMN_METADATA = {
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
    household_size: {
        label: "世帯人数",
        type: "integer",
        groupable: true,
    },
    members_under_15: {
        label: "15歳未満人数",
        type: "integer",
        groupable: true,
    },
    percentage_under_15: {
        label: "15歳未満割合",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    members_15_to_64: {
        label: "15-64歳人数",
        type: "integer",
        groupable: true,
    },
    percentage_15_to_64: {
        label: "15-64歳割合",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    members_over_65: {
        label: "65歳以上人数",
        type: "integer",
        groupable: true,
    },
    percentage_over_65: {
        label: "65歳以上割合",
        type: "float",
        groupable: true,
        unit: "%",
        percentage: true,
    },
    gender_ratio: {
        label: "性比",
        type: "float",
        groupable: true,
    },
    residence_duration: {
        label: "居住期間",
        type: "integer",
        groupable: true,
    },
    water_supply_number: {
        label: "水道番号",
        type: "string",
        groupable: true,
    },
    water_disconnection_flag: {
        label: "断水フラグ",
        type: "string",
        groupable: true,
    },
    max_water_usage: {
        label: "最大水道使用量",
        type: "integer",
        groupable: true,
    },
    avg_water_usage: {
        label: "平均水道使用量",
        type: "integer",
        groupable: true,
    },
    total_water_usage: {
        label: "合計水道使用量",
        type: "integer",
        groupable: true,
    },
    min_water_usage: {
        label: "最小水道使用量",
        type: "integer",
        groupable: true,
    },
    water_supply_source_info: {
        label: "水道情報元",
        type: "string",
        groupable: true,
    },
    structure_name: {
        label: "構造名",
        type: "string",
        groupable: true,
    },
    registration_date: {
        label: "登録日",
        type: "string",
        groupable: true,
    },
    registration_source_info: {
        label: "登記情報元",
        type: "string",
        groupable: true,
    },
    vacant_house_id: {
        label: "空き家ID",
        type: "string",
        groupable: true,
    },
    vacant_house_address: {
        label: "空き家住所",
        type: "string",
        groupable: true,
    },
    gml_id: {
        label: "GML ID",
        type: "string",
        groupable: true,
    },
    measuredheight: {
        label: "測定高さ",
        type: "float",
        groupable: true,
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
    },
    duration: {
        label: "期間",
        type: "integer",
        groupable: true,
    },
    floors_above_ground: {
        label: "地上階数",
        type: "integer",
        groupable: true,
    },
    floors_below_ground: {
        label: "地下階数",
        type: "integer",
        groupable: true,
    },
    inland_flooding_risk_desc: {
        label: "洪水リスク説明",
        type: "string",
        groupable: true,
    },
    inland_flooding_risk_rank: {
        label: "洪水リスクランク",
        type: "integer",
        groupable: true,
    },
    inland_flooding_risk_depth: {
        label: "洪水リスク深さ",
        type: "float",
        groupable: true,
    },
    river_flooding_risk_depth: {
        label: "河川氾濫リスク深さ",
        type: "float",
        groupable: true,
    },
    river_flooding_risk_rank: {
        label: "河川氾濫リスクランク",
        type: "integer",
        groupable: true,
    },
    river_flooding_risk_desc: {
        label: "河川氾濫リスク説明",
        type: "string",
        groupable: true,
    },
    landslide_risk_desc: {
        label: "地滑りリスク説明",
        type: "string",
        groupable: true,
    },
    name: {
        label: "建物名",
        type: "string",
        groupable: true,
    },
    predicted_label: {
        label: "予測ラベル",
        type: "string",
        groupable: true,
    },
    predicted_probability: {
        label: "予測確率",
        type: "float",
        groupable: true,
    },
} satisfies ColumnMetadata<BUILDING_DATASET_COLUMN>;