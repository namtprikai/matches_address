/** result-viewテーブルに入っている値の整理 */

import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../../config/column-metadata";
import { type FilterConditionValue } from "./filter-operation";
import { type GroupConditionValue } from "./group-operation";

export interface ParameterBase {
  key: string;
  type:
    | "filter" /** フィルター */
    | "column" /** 設定のグループ以外の項目？ */
    | "group" /** グループ */
    | "group_aggregation" /** グループ集計 */;
  value: unknown;
}

/** X軸:棒・折れ線で共通で利用される */
export interface XAxis extends ParameterBase {
  key: "xAxis";
  type: "column";
  value: BUILDING_DATASET_COLUMN & AREA_DATASET_COLUMN;
}

/** Y軸:棒・折れ線で共通で利用される */
export interface YAxis extends ParameterBase {
  key: "yAxis";
  type: "column";
  value: BUILDING_DATASET_COLUMN & AREA_DATASET_COLUMN;
}
//

/** ラベルグループ 動的作成 */
export interface GroupCondition extends ParameterBase {
  key: `group_${string}`;
  type: "group";
  value: GroupConditionValue;
}

/** 折れ線グラフ/円グラフ:Y軸/値の集計方法 */
export interface GroupAggregation extends ParameterBase {
  key: "group_aggregation" /** 元: group_aggregation */;
  type: "group_aggregation" /** 元: group_aggregation */;
  value: "avg" | "sum" | "count";
}

/** 表:カラム */
export interface TableColumns extends ParameterBase {
  key: "columns";
  type: "column";
  value: string;
}

/** フィルター:年 */
export interface YearFilter extends ParameterBase {
  key: "year";
  type: "filter";
  value: { start: string; end: string };
}

/** フィルター:エリア */
export interface AreaFilter extends ParameterBase {
  key: "area";
  type: "filter";
  value: string[];
}

/** フィルター詳細条件 */
export interface FilterCondition extends ParameterBase {
  key: `filter_${string}`;
  type: "filter";
  value: FilterConditionValue;
}

/** 円グラフ:ラベル */
export interface PieLabel extends ParameterBase {
  key: "label";
  type: "column";
  value: BUILDING_DATASET_COLUMN & AREA_DATASET_COLUMN;
}

/** 円グラフ:値 */
export interface PieValue extends ParameterBase {
  key: "value";
  type: "column";
  value: BUILDING_DATASET_COLUMN & AREA_DATASET_COLUMN;
}
