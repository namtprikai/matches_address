import { type ChartColumnType } from "../@types/charts";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";

export type AREA_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailArea,
  "area" | "area_group"
>;
export type BUILDING_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailBuilding,
  | "area_group"
  | "reference_date"
  | "household_size"
  | "members_under_15"
  | "percentage_under_15"
  | "members_15_to_64"
  | "percentage_15_to_64"
  | "members_over_65"
  | "percentage_over_65"
  | "predicted_probability"
  | "duration"
  | "measuredheight"
  | "rank"
  | "depth"
  | "floors_above_ground"
  | "inland_flooding_risk_rank"
  | "inland_flooding_risk_depth"
  | "river_flooding_risk_rank"
  | "river_flooding_risk_depth"
>;

export type ColumnMetadata<COLUMN extends string | number | symbol> = Partial<{
  [k in COLUMN]: {
    label: string;
    type: ChartColumnType;
    unit?: string;
    groupable?: boolean; // グルーピング可能かどうか
    description?: string;
  };
}>;

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
} satisfies ColumnMetadata<AREA_DATASET_COLUMN>;

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 */
export const BUILDING_DATASET_COLUMN_METADATA = {
  area_group: {
    label: "住所",
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
    type: "percentage",
    groupable: true,
    unit: "%",
  },
  duration: {
    label: "住定期間",
    type: "integer",
    groupable: true,
    unit: "日間",
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
  floors_above_ground: {
    label: "地上階数",
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
