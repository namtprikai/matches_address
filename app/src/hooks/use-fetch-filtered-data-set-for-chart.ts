import { useCallback, useEffect, useState } from "react";
import { type ChartProps } from "../@types/charts";
import { type data_set_detail_areas, type data_set_detail_buildings } from "../schema";

export const useFetchFilterDataSetForChart = ({ resultId, type, x, y }: { resultId: number } & (
    { type: "buildings"; x: keyof typeof data_set_detail_buildings.$inferSelect; y: keyof typeof data_set_detail_buildings.$inferSelect } |
    { type: "areas"; x: keyof typeof data_set_detail_areas.$inferSelect; y: keyof typeof data_set_detail_areas.$inferSelect }
)): {
    chartProps: ChartProps;
    refetch: () => Promise<void>;
} => {

    const [chartProps, setChartProps] = useState<ChartProps | {
        data: { x: string; y: number }[];
        xAxisColumn: { type: "string" };
        yAxisColumn: { type: "number" };
    }>({ data: [], xAxisColumn: { type: "string" }, yAxisColumn: { type: "number" } });

    const fetchFilteredDataSetDetailBuildingsForChart = useCallback(async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("filterDataSetForChart", { resultId, type: "buildings", x, y });
        setChartProps(result);
    }, [resultId, x, y]);

    const fetchFilteredDataSetDetailAreasForChart = useCallback(async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("filterDataSetForChart", { resultId, type: "buildings", x, y });
        setChartProps(result);
    }, [resultId, x, y]);

    useEffect(() => {
        if (type === "buildings")
            fetchFilteredDataSetDetailBuildingsForChart().catch(console.error);
        if (type === "areas")
            fetchFilteredDataSetDetailAreasForChart().catch(console.error);

    }, [fetchFilteredDataSetDetailAreasForChart, fetchFilteredDataSetDetailBuildingsForChart, type]);

    if (type === "buildings") {
        return { chartProps, refetch: fetchFilteredDataSetDetailBuildingsForChart };
    }

    if (type === "areas") {
        return { chartProps, refetch: fetchFilteredDataSetDetailAreasForChart };
    }

    return { chartProps, refetch: async () => { return } }
};
