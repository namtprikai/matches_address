import { useCallback, useEffect, useState } from "react";
import { type ChartProps } from "../@types/charts";
import { type data_set_detail_areas, type data_set_detail_buildings } from "../schema";

export const useFetchFilterDataSetForChart = ({ resultId, type, x, y }: { resultId: number } & (
    { type: "building"; x: keyof typeof data_set_detail_buildings.$inferSelect; y: keyof typeof data_set_detail_buildings.$inferSelect } |
    { type: "area"; x: keyof typeof data_set_detail_areas.$inferSelect; y: keyof typeof data_set_detail_areas.$inferSelect }
)): {
    chartProps: ChartProps;
    refetch: () => Promise<void>;
} => {

    const [chartProps, setChartProps] = useState<ChartProps | {
        data: { x: string; y: number }[];
        xAxisColumn: { type: "string" };
        yAxisColumn: { type: "number" };
    }>({ data: [], xAxisColumn: { type: "string" }, yAxisColumn: { type: "number" } });

    const fetchFilteredDataSetForChart = useCallback(async (): Promise<void> => {
        if (type === "area") {
            const result = await window.ipcRenderer.invoke("filterDataSetForChart", { resultId, type: "area", x, y });
            setChartProps(result);
        }
        if (type === "building") {
            const result = await window.ipcRenderer.invoke("filterDataSetForChart", { resultId, type: "building", x, y });
            setChartProps(result);
        }
    }, [resultId, x, y, type]);

    useEffect(() => {
        fetchFilteredDataSetForChart().catch(console.error);

    }, [fetchFilteredDataSetForChart, type]);

    if (type === "building" || type === "area") {
        return { chartProps, refetch: fetchFilteredDataSetForChart };
    }


    return { chartProps, refetch: async () => { return } }
};
