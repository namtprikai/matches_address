import { useCallback, useEffect, useState } from "react";
import { type ChartProps } from "../@types/charts";
import { type FilterDataSetForChartArgs } from "../ipc-main-listeners/filter-data-set-for-chart";

export const useFetchFilterDataSetForChart = (
  props: FilterDataSetForChartArgs,
): {
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
    const result = await window.ipcRenderer.invoke(
      "filterDataSetForChart",
      props,
    );
    setChartProps(result);
  }, [props]);

  useEffect(() => {
    fetchFilteredDataSetForChart().catch(console.error);
  }, [fetchFilteredDataSetForChart]);

  return {
    chartProps,
    refetch: async () => {
      return;
    },
  };
};
