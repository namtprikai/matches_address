import { useCallback, useEffect, useState } from "react";
import { type ChartProps } from "../@types/charts";
import {
    type SelectDataSetDetailBuilding,
    type SelectDataSetDetailArea,
} from "../schema";
import { type GroupingCondition } from "../utils/subquery-grouping";

export const useFetchFilterDataSetForChart = ({
    resultId,
    type,
    x,
    y,
    groupingConditions
}: { resultId: number, groupingConditions?: GroupingCondition[] } & (
    | {
        type: "building";
        x: keyof SelectDataSetDetailBuilding;
        y: keyof SelectDataSetDetailBuilding;
    }
    | {
        type: "area";
        x: keyof SelectDataSetDetailArea;
        y: keyof SelectDataSetDetailArea;
    }
)): {
    chartProps: ChartProps;
    refetch: () => Promise<void>;
} => {
    const [chartProps, setChartProps] = useState<
        | ChartProps
        | {
            data: { x: string; y: number }[];
            xAxisColumn: { type: "string" };
            yAxisColumn: { type: "number" };
        }
    >({
        data: [],
        xAxisColumn: { type: "string" },
        yAxisColumn: { type: "number" },
    });

    const fetchFilteredDataSetForChart = useCallback(async (): Promise<void> => {
        if (type === "area") {
            const result = await window.ipcRenderer.invoke("filterDataSetForChart", {
                resultId,
                type: "area",
                x,
                y,
                groupingConditions
            });
            setChartProps(result);
        }
        if (type === "building") {
            const result = await window.ipcRenderer.invoke("filterDataSetForChart", {
                resultId,
                type: "building",
                x,
                y,
                groupingConditions
            });
            setChartProps(result);
        }
    }, [resultId, x, y, type, groupingConditions]);

    useEffect(() => {
        fetchFilteredDataSetForChart().catch(console.error);
    }, [fetchFilteredDataSetForChart, type]);

    if (type === "building" || type === "area") {
        return { chartProps, refetch: fetchFilteredDataSetForChart };
    }

    return {
        chartProps,
        refetch: async () => {
            return;
        },
    };
};
