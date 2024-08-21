import { string } from "zod";

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

export interface TableViewProps {
    columns: string[],
    data: Record<string, string | number | null>[]
}