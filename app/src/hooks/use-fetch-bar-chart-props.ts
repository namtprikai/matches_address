import { useCallback, useEffect } from "react";
import { type ChartProps } from "../@types/charts";
import { type BarView } from "../bi-modules/interfaces/view";
import { usePagination, type UsePaginationReturnType } from "./use-pagination";
import { useChartProps } from "./use-chart-props";

type Params = {
  view: BarView;
};

type ReturnType = {
  chartProps: ChartProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
};

export const useFetchBarChartProps = ({ view }: Params): ReturnType => {
  const pagination = usePagination(100);
  const { chartProps, handleChartProps } = useChartProps();

  const fetch = useCallback(async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("_debugFetchChart", {
      view,
      pagination: {
        limit: pagination.limitPerPage,
        offset: pagination.limitPerPage * (pagination.page - 1),
      },
    });
    handleChartProps({
      data: result.map((item) => ({
        x: item.x,
        y: item.y,
      })),
      xAxisColumn: { type: "string" },
      yAxisColumn: { type: "number" },
    });
  }, [pagination.limitPerPage, pagination.page, view, handleChartProps]);

  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  return {
    chartProps,
    refetch: fetch,
    pagination,
  };
};
