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

export interface TableProps {
    columns: {
        key: string;
        label: string,
    }[],
    data: Record<string, string | number | null>[]
}

export interface Parameter {
    key: string;
    value: string;
}

export type ChartDynamicColumnInput = "select" | "input" | "dropdown";

export type ChartStyle = "pie" | "bar" | "line" | "table" | "map";

export type ResultViewFieldOption = {
    key: string;
    label: string;
    type: ChartDynamicColumnInput;
    accept: readonly ChartColumnType[];
    multiple?: boolean;
}