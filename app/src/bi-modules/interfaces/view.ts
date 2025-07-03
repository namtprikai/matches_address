import { type OrderByQuery, type PaginationQuery } from "../../@types/query";
import {
  type SelectDataSetDetailBuilding,
  type SelectDataSetDetailArea,
} from "../../schema";
import {
  type AreaFilter,
  type FilterCondition,
  type GroupCondition,
  type PieLabel,
  type PieValue,
  type TableColumns,
  type YearFilter,
  type XAxis,
  type YAxis,
  type ParameterBase,
  type GroupAggregation,
} from "./parameter";

export const VIEW_STYLES = [
  "bar",
  "line",
  "pie",
  "table",
  "map",
  "map-with-table",
] as const;

/**
 * View: 保存する際の型
 */
interface ViewBase {
  id: number;
  dataSetResultId: number;
  style: (typeof VIEW_STYLES)[number];
  title: string;
  unit: "building" | "area";
  parameters: ParameterBase[];
  /**
   * yearプロパティはparameters.YearFilter と被っていそう
   * areasプロパティはparameters.AreaFilter と被っていそうかつ、更新されていなそう
   */
}

export interface MapView extends ViewBase {
  style: "map";
  parameters: (YearFilter | AreaFilter)[];
}

/** 棒グラフ */
export interface BarView extends ViewBase {
  style: "bar";
  parameters: (
    | YearFilter
    | AreaFilter
    | FilterCondition
    | GroupCondition
    | GroupAggregation
    | XAxis
    | YAxis
  )[];

  pagination: PaginationQuery;
  orderBy: OrderByQuery<keyof SelectDataSetDetailArea> | null;
}

/** 折れ線グラフ */
export interface LineView extends ViewBase {
  style: "line";
  parameters: (
    | YearFilter
    | AreaFilter
    | FilterCondition
    | GroupCondition
    | GroupAggregation
    | XAxis
    | YAxis
  )[];

  orderBy: OrderByQuery<keyof SelectDataSetDetailBuilding> | null;
}

/** 円グラフ */
export interface PieView extends ViewBase {
  style: "pie";
  parameters: (
    | YearFilter
    | AreaFilter
    | FilterCondition
    | GroupCondition
    | GroupAggregation
    | PieLabel
    | PieValue
  )[];
}

/** 表 */
export interface TableView extends ViewBase {
  style: "table";
  parameters: (YearFilter | AreaFilter | FilterCondition | TableColumns)[];
}

/** 地図 + テーブル */
export interface MapWithTableView extends ViewBase {
  style: "map-with-table";
  parameters: (YearFilter | AreaFilter | FilterCondition | TableColumns)[];
}

export type View =
  | BarView
  | LineView
  | PieView
  | TableView
  | MapView
  | MapWithTableView;
