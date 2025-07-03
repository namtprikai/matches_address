import { useCallback, useEffect } from "react";
import { useAtomValue } from "jotai";
import { type ChartProps } from "../../@types/charts";
import { type BarView } from "../interfaces/view";
import {
  usePagination,
  type UsePaginationReturnType,
} from "../../hooks/use-pagination";
import { useIsLoading } from "../../hooks/use-is-loading";
import { submittedEditViewFormAtom } from "../../state/submitted-edit-view-form-atom";
import {
  useOrderBy,
  type UseOrderByReturnType,
} from "../../hooks/use-order-by";
import { type SelectDataSetDetailArea } from "../../schema";
import { useChartProps } from "./use-chart-props";
import { useWorkbookIdsSearchQuery } from "./use-workbook-ids-search-query";

type Params = {
  view: BarView;
};

type ReturnType = {
  chartProps: ChartProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
  isLoading: boolean;
  useOrderBy: UseOrderByReturnType<keyof SelectDataSetDetailArea>;
};

export const useFetchBarChartProps = ({ view }: Params): ReturnType => {
  const { chartProps, handleChartProps } = useChartProps();
  const { isLoading, handleIsLoading } = useIsLoading({ init: true });

  const pagination = usePagination({
    total: chartProps.totalCount,
    perPage: 100,
  });

  const { orderBy, handleColumnChange } =
    useOrderBy<keyof SelectDataSetDetailArea>("reference_date");

  const { viewId } = useWorkbookIdsSearchQuery();
  const setSubmittedEditViewFormState = useAtomValue(submittedEditViewFormAtom);

  const fetch = useCallback(
    async (value: BarView): Promise<void> => {
      try {
        handleIsLoading(true);
        const result = await window.ipcRenderer.invoke("fetchChartData", {
          view: {
            ...value,
            pagination: {
              limit: pagination.limitPerPage,
              offset: pagination.limitPerPage * (pagination.page - 1),
            },
            orderBy,
          },
        });
        handleChartProps(result);
      } catch (error) {
        console.error(error);
      } finally {
        handleIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleIsLoading を追加するよう指摘されるが、追加すると無限ループになるため無視 @fixme
    [
      pagination.limitPerPage,
      pagination.page,
      handleChartProps,
      orderBy.column,
      orderBy.direction,
    ],
  );

  /** 初期化 */
  useEffect(() => {
    fetch(view).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- viewの変更を検知すると余計な更新が入るので無視 @fixme
  }, [fetch]);

  useEffect(() => {
    if (setSubmittedEditViewFormState && Number(viewId) === view.id) {
      fetch(view).catch(console.error);
    }
  }, [setSubmittedEditViewFormState, fetch, view, viewId]);

  return {
    chartProps,
    refetch: () => fetch(view),
    pagination,
    isLoading,
    useOrderBy: {
      orderBy,
      handleColumnChange,
    },
  };
};
