import { type ChartColumnType } from "../@types/charts";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";

// 選択基準のドキュメントなし。コードが正
export type AREA_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailArea,
  | "area"
  | "area_group"
  | "young_population_ratio"
  | "elderly_population_ratio"
  | "total_building_count"
  | "vacant_house_count"
  | "predicted_probability"
>;

// 選択基準: https://www.notion.so/eukarya/a46c46fe1b9e4261b81c6c0a8df87189
export type BUILDING_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailBuilding,
  | "area_group"
  | "reference_date"
  | "normalized_address"
  | "household_code"
  | "household_size"
  | "members_under_15"
  | "percentage_under_15"
  | "members_15_to_64"
  | "percentage_15_to_64"
  | "members_over_65"
  | "percentage_over_65"
  | "gender_ratio"
  | "water_supply_number"
  | "water_disconnection_flag"
  | "max_water_usage"
  | "avg_water_usage"
  | "min_water_usage"
  | "total_water_usage"
  | "water_supply_source_info"
  | "structure_name"
  | "registration_date"
  | "registration_source_info"
  | "duration"
  | "measuredheight"
  | "rank"
  | "depth"
  | "floors_above_ground"
  | "floors_below_ground"
  | "inland_flooding_risk_rank"
  | "inland_flooding_risk_depth"
  | "name"
  | "river_flooding_risk_desc"
  | "river_flooding_risk_rank"
  | "river_flooding_risk_depth"
  | "landslide_risk_desc"
  | "vacant_house_id"
  | "vacant_house_address"
  | "predicted_probability"
  | "predicted_label"
>;

export type ColumnMetadata<COLUMN extends string | number | symbol> = {
  [k in COLUMN]: {
    label: string;
    type: ChartColumnType;
    unit?: string;
    groupable?: boolean; // グルーピング可能かどうか
    description?: string;
  };
};

/**
 * D903のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const AREA_DATASET_COLUMN_METADATA = {
  area: {
    label: "面積",
    type: "float",
    groupable: true,
    unit: "m^2",
  },
  area_group: {
    label: "地域区分",
    type: "text",
    groupable: true,
    unit: "",
  },
  young_population_ratio: {
    label: "若年層率",
    type: "float",
    groupable: true,
    unit: "%",
  },
  elderly_population_ratio: {
    label: "高齢者率",
    type: "float",
    groupable: true,
    unit: "%",
  },
  total_building_count: {
    label: "建物数",
    type: "integer",
    groupable: true,
    unit: "棟",
  },
  predicted_probability: {
    label: "予測確率",
    type: "float",
    groupable: true,
    unit: "%",
  },
  vacant_house_count: {
    label: "空き家数",
    type: "integer",
    groupable: true,
    unit: "棟",
  },
} satisfies ColumnMetadata<AREA_DATASET_COLUMN>;

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const BUILDING_DATASET_COLUMN_METADATA = {
  area_group: {
    label: "建物所属地域区分",
    type: "text",
    groupable: true,
    unit: "",
  },
  normalized_address: {
    label: "正規化住所",
    type: "text",
    groupable: true,
    unit: "",
  },
  household_code: {
    label: "世帯番号",
    type: "text",
    groupable: true,
    unit: "",
  },
  reference_date: {
    label: "基準日",
    type: "date",
    groupable: true,
    unit: "",
  },
  household_size: {
    label: "世帯人数",
    type: "integer",
    groupable: true,
    unit: "人",
  },
  members_under_15: {
    label: "15歳未満人数",
    type: "integer",
    groupable: true,
    unit: "人",
  },
  members_15_to_64: {
    label: "15-64歳人数",
    type: "integer",
    groupable: true,
    unit: "人",
  },
  percentage_under_15: {
    label: "15歳未満割合",
    type: "float",
    groupable: true,
    unit: "%",
  },
  percentage_15_to_64: {
    label: "15-64歳割合",
    type: "float",
    groupable: true,
    unit: "%",
  },
  members_over_65: {
    label: "65歳以上人数",
    type: "integer",
    groupable: true,
    unit: "人",
  },
  percentage_over_65: {
    label: "65歳以上割合",
    type: "float",
    groupable: true,
    unit: "%",
  },
  predicted_probability: {
    label: "予測確率",
    type: "float",
    groupable: true,
    unit: "%",
  },
  predicted_label: {
    label: "予測判定",
    type: "boolean",
    groupable: true,
    unit: "",
  },
  gender_ratio: {
    label: "男女比",
    type: "float",
    groupable: true,
    unit: "",
  },
  water_disconnection_flag: {
    label: "断水フラグ",
    type: "boolean",
    groupable: true,
    unit: "",
  },
  max_water_usage: {
    label: "最大水道使用量",
    type: "integer",
    groupable: true,
    unit: "L",
  },
  avg_water_usage: {
    label: "平均水道使用量",
    type: "integer",
    groupable: true,
    unit: "L",
  },
  min_water_usage: {
    label: "最小水道使用量",
    type: "integer",
    groupable: true,
    unit: "L",
  },
  total_water_usage: {
    label: "合計水道使用量",
    type: "integer",
    groupable: true,
    unit: "L",
  },
  water_supply_number: {
    label: "水道番号",
    type: "text",
    groupable: true,
    unit: "",
  },
  water_supply_source_info: {
    label: "名寄せ元情報_水道",
    type: "text",
    groupable: true,
    unit: "",
  },
  structure_name: {
    label: "登記上構造名称",
    type: "text",
    groupable: true,
    unit: "",
  },
  registration_date: {
    label: "登記年月日",
    type: "date",
    groupable: true,
    unit: "",
  },
  registration_source_info: {
    label: "名寄せ元情報_登記",
    type: "text",
    groupable: true,
    unit: "",
  },
  vacant_house_id: {
    label: "空き家ID", // シートとの異なるが個人判断で名称を変更 by nishimura
    type: "text",
    groupable: true,
    unit: "",
  },
  vacant_house_address: {
    label: "空き家住所", // シートとの異なるが個人判断で名称を変更 by nishimura
    type: "text",
    groupable: true,
    unit: "",
  },

  measuredheight: {
    label: "測定高さ",
    type: "integer",
    groupable: true,
    unit: "m",
  },
  rank: {
    label: "ランク",
    type: "integer",
    groupable: true,
    unit: "",
  },
  depth: {
    label: "浸水深",
    type: "integer",
    groupable: true,
    unit: "m",
  },
  duration: {
    label: "洪水浸水時間",
    type: "integer",
    groupable: true,
    unit: "時間",
  },
  floors_above_ground: {
    label: "地上階数",
    type: "integer",
    groupable: true,
    unit: "階",
  },
  name: {
    label: "建物名",
    type: "text",
    groupable: true,
    unit: "",
  },
  floors_below_ground: {
    label: "地下階数",
    type: "integer",
    groupable: true,
    unit: "階",
  },
  inland_flooding_risk_rank: {
    label: "内水氾濫リスクランク",
    type: "integer",
    groupable: true,
    unit: "",
  },
  inland_flooding_risk_depth: {
    label: "内水氾濫リスク深さ",
    type: "integer",
    groupable: true,
    unit: "m",
  },
  landslide_risk_desc: {
    label: "地滑りリスク備考",
    type: "text",
    groupable: true,
    unit: "",
  },
  river_flooding_risk_desc: {
    label: "河川氾濫リスク備考",
    type: "text",
    groupable: true,
    unit: "",
  },
  river_flooding_risk_rank: {
    label: "河川氾濫リスクランク",
    type: "integer",
    groupable: true,
    unit: "",
  },
  river_flooding_risk_depth: {
    label: "河川氾濫リスク深さ",
    type: "integer",
    groupable: true,
    unit: "m",
  },
} satisfies ColumnMetadata<BUILDING_DATASET_COLUMN>;

export const ALL_DATASET_COLUMN_METADATA = {
  ...AREA_DATASET_COLUMN_METADATA,
  ...BUILDING_DATASET_COLUMN_METADATA,
};
