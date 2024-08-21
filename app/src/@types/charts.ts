export interface ChartColumn {
    type: "string" | "number";
    unit?: string;
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