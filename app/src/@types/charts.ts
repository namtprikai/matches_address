import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";

/**
 * チャートのカラムが受け付けられる型
 * JavaScriptではdateとstring, floatとintegerを区別できないため、明示する必要がある
 */
export type ChartColumnType =
  | "text"
  | "integer"
  | "date"
  | "float"
  | "percentage"
  | "boolean"
  | "enum";

export interface ChartColumn {
  type: "string" | "number";
  unit?: string;
  label?: string;
}

export interface ChartData {
  x: string | number;
  y: number;
}

export interface ChartProps {
  data: ChartData[];
  xAxisColumn: ChartColumn;
  yAxisColumn: ChartColumn;
}

export interface TableProps {
  columns: {
    key: string;
    label: string;
    unit?: string;
  }[];
  data: Record<string, string | number | null>[];
}

export interface Parameter {
  key: string;
  value: string;
  type: "column" | "group" | "filter";
}

export type ChartDynamicColumnInput = "select" | "input" | "dropdown";

export type TileViewStyle = "pie" | "bar" | "line" | "table" | "map";

export type TileViewFieldOption = {
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
            value: BUILDING_DATASET_COLUMN;
          }
        | {
            unit: "area";
            value: AREA_DATASET_COLUMN;
          }
      )[];
    }
  | {
      type: "dropdown";
      multiple: boolean;
      option: (
        | {
            unit: "building";
            value: BUILDING_DATASET_COLUMN;
          }
        | {
            unit: "area";
            value: AREA_DATASET_COLUMN;
          }
      )[];
    }
);
