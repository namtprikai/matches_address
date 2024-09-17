import { type TileViewStyle } from "../@types/charts";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";

/**
 * 各チャートのパラーメーターやグルーピング可能かどうかなどの設定をハードコードで定義している
 * 永続化の必要がない（＝エンドユーザーが変更しない）点、
 * JSONで記述するよりも型補完が効く点を踏まえ柔軟にコードができるためにTypeScriptで記述した
 */
export const TILE_VIEW_CONFIG = {
  // チャートスタイルごとにコンフィグを定義
  pie: {
    fields: [
      // fieldsはパラメーターやフィルターの設定を行う
      {
        key: "label", // フィールドのキー(DBのparametersのkeyに対応)
        label: "ラベル", // フィールドのラベル、DBには保存せずkeyから引く形をとる
        type: "select", // フィールドの入力方法を指定
        option: [
          // ドロップダウンやセレクトボックスの選択肢を指定
          { unit: "building", value: "household_size" },
          { unit: "building", value: "members_under_15" },
          { unit: "building", value: "members_15_to_64" },
          { unit: "building", value: "members_over_65" },
          { unit: "building", value: "percentage_15_to_64" },
          { unit: "building", value: "percentage_over_65" },
          { unit: "building", value: "duration" },
          { unit: "building", value: "measuredheight" },
          { unit: "building", value: "rank" },
          { unit: "building", value: "depth" },
          { unit: "building", value: "floors_above_ground" },
          { unit: "building", value: "inland_flooding_risk_rank" },
          { unit: "building", value: "inland_flooding_risk_depth" },
          { unit: "building", value: "river_flooding_risk_rank" },
          { unit: "building", value: "river_flooding_risk_depth" },
          { unit: "building", value: "predicted_probability" },
          { unit: "area", value: "area" },
        ],
        grouping: true,
      },
      {
        key: "value",
        label: "値",
        type: "select",
        option: [
          { unit: "building", value: "household_size" },
          { unit: "building", value: "members_under_15" },
          { unit: "building", value: "members_15_to_64" },
          { unit: "building", value: "members_over_65" },
          { unit: "building", value: "percentage_15_to_64" },
          { unit: "building", value: "percentage_over_65" },
          { unit: "building", value: "duration" },
          { unit: "building", value: "measuredheight" },
          { unit: "building", value: "rank" },
          { unit: "building", value: "depth" },
          { unit: "building", value: "floors_above_ground" },
          { unit: "building", value: "inland_flooding_risk_rank" },
          { unit: "building", value: "inland_flooding_risk_depth" },
          { unit: "building", value: "river_flooding_risk_rank" },
          { unit: "building", value: "river_flooding_risk_depth" },
          { unit: "building", value: "predicted_probability" },
        ],
        grouping: false,
      },
    ],
  },
  bar: {
    fields: [
      {
        key: "xAxis",
        label: "X軸",
        type: "select",
        option: [{ unit: "building", value: "normalized_address" }],
        grouping: true,
      },
      {
        key: "yAxis",
        label: "Y軸",
        type: "select",
        option: [
          { unit: "building", value: "household_size" },
          { unit: "building", value: "members_under_15" },
          { unit: "building", value: "members_15_to_64" },
          { unit: "building", value: "members_over_65" },
          { unit: "building", value: "percentage_15_to_64" },
          { unit: "building", value: "percentage_over_65" },
          { unit: "building", value: "predicted_probability" },
        ],
        grouping: false,
      },
    ],
  },
  line: {
    fields: [
      {
        key: "xAxis",
        label: "X軸",
        type: "select",
        option: [
          {
            unit: "building",
            value: "reference_date",
          },
        ],
        grouping: true,
      },
      {
        key: "yAxis",
        label: "Y軸",
        type: "select",
        option: [
          { unit: "building", value: "household_size" },
          { unit: "building", value: "members_under_15" },
          { unit: "building", value: "members_15_to_64" },
          { unit: "building", value: "members_over_65" },
          { unit: "building", value: "percentage_15_to_64" },
          { unit: "building", value: "percentage_over_65" },
          { unit: "building", value: "predicted_probability" },
        ],
        grouping: false,
      },
    ],
  },
  map: {
    fields: [],
  },
  table: {
    fields: [
      {
        key: "columns",
        label: "カラム",
        type: "dropdown",
        option: [
          {
            unit: "building",
            value: "household_size",
          },
        ],
        multiple: true,
        grouping: false,
      },
    ],
  },
} satisfies {
  [k in TileViewStyle]: {
    fields: ({
      key: string;
      label: string;
      multiple?: boolean;
      grouping: boolean;
    } & (
      | {
          type: "select";
          option: (
            | {
                unit: "building";
                value: keyof SelectDataSetDetailBuilding;
              }
            | {
                unit: "area";
                value: keyof SelectDataSetDetailArea;
              }
          )[];
        }
      | {
          type: "dropdown";
          multiple: boolean;
          option: (
            | {
                unit: "building";
                value: keyof SelectDataSetDetailBuilding;
              }
            | {
                unit: "area";
                value: keyof SelectDataSetDetailArea;
              }
          )[];
        }
    ))[];
  };
};
