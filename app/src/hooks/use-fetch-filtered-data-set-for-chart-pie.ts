import { useCallback, useEffect, useState } from "react";
import { type ChartProps } from "../@types/charts";
import { type FilterDataSetForChartArgs } from "../ipc-main-listeners/filter-data-set-for-chart";
import { usePagination, type UsePaginationReturnType } from "./use-pagination";

type ReturnType = {
  chartProps: ChartProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
};

/** @fixme 暫定: useFetchFilterDataSetForChartとほぼ同一 #703 */
export const useFetchFilterDataSetForChartPie = (
  props: FilterDataSetForChartArgs,
): ReturnType => {
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

  const pagination = usePagination(100);

  const fetchFilteredDataSetDetailForChart =
    useCallback(async (): Promise<void> => {
      const result = await window.ipcRenderer.invoke(
        "filterDataSetForChartPie",
        {
          ...props,
          limit: pagination.limitPerPage,
          offset: pagination.limitPerPage * (pagination.page - 1),
        },
      );
      setChartProps(result);
    }, [pagination.limitPerPage, pagination.page, props]);

  useEffect(() => {
    fetchFilteredDataSetDetailForChart().catch(console.error);
  }, [
    fetchFilteredDataSetDetailForChart,
    pagination.limitPerPage,
    pagination.page,
  ]);

  return {
    chartProps,
    refetch: fetchFilteredDataSetDetailForChart,
    pagination,
  };
};
