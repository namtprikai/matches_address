import { useCallback, useEffect } from "react";
import { type ChartProps } from "../../@types/charts";
import { type LineView } from "../interfaces/view";
import {
  usePagination,
  type UsePaginationReturnType,
} from "../../hooks/use-pagination";
import { useIsLoading } from "../../hooks/use-is-loading";
import { useChartProps } from "./use-chart-props";

type Params = {
  view: LineView;
};

type ReturnType = {
  chartProps: ChartProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
  isLoading: boolean;
};

export const useFetchLineChartProps = ({ view }: Params): ReturnType => {
  const pagination = usePagination(100);
  const { chartProps, handleChartProps } = useChartProps();
  const { isLoading, handleIsLoading } = useIsLoading({ init: true });

  console.log({ view, chartProps });

  const fetch = useCallback(async (): Promise<void> => {
    try {
      handleIsLoading(true);
      const result = await window.ipcRenderer.invoke("fetchChartData", {
        view,
        pagination: {
          limit: pagination.limitPerPage,
          offset: pagination.limitPerPage * (pagination.page - 1),
        },
      });

      handleChartProps(result);
    } catch (error) {
      console.error(error);
    } finally {
      handleIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleIsLoading を追加するよう指摘されるが、追加すると無限ループになるため無視 @fixme
  }, [pagination.limitPerPage, pagination.page, view, handleChartProps]);

  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  return {
    chartProps,
    refetch: fetch,
    pagination,
    isLoading,
  };
};
