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