
/** 
 * チャートのカラムが受け付けられる型
 * JavaScriptではdateとstring, floatとintegerを区別できないため、明示する必要がある
 */
export type ChartColumnType = "string" | "integer" | "date" | "float"

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
    data: ChartData[],
    xAxisColumn: ChartColumn,
    yAxisColumn: ChartColumn
}

export interface Parameter {
    key: string;
    value: string;
}

export type ChartDynamicColumnInput = "select" | "input";

export type ChartStyle = "pie" | "bar" | "line" | "table" | "map";

export interface ResultViewFieldOption {
    key: string;
    label: string;
    type: ChartDynamicColumnInput;
    accept: readonly ChartColumnType[];
}