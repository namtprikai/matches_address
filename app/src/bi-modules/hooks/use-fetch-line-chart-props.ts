import { useCallback, useEffect } from "react";
import { useAtomValue } from "jotai";
import { type ChartProps } from "../../@types/charts";
import { type LineView } from "../interfaces/view";
import { useIsLoading } from "../../hooks/use-is-loading";
import { submittedEditViewFormAtom } from "../../state/submitted-edit-view-form-atom";
import { useChartProps } from "./use-chart-props";
import { useWorkbookIdsSearchQuery } from "./use-workbook-ids-search-query";

type Params = {
  view: LineView;
};

type ReturnType = {
  chartProps: ChartProps;
  refetch: () => Promise<void>;
  isLoading: boolean;
};

export const useFetchLineChartProps = ({ view }: Params): ReturnType => {
  const { chartProps, handleChartProps } = useChartProps();
  const { isLoading, handleIsLoading } = useIsLoading({ init: true });

  const { viewId } = useWorkbookIdsSearchQuery();
  const setSubmittedEditViewFormState = useAtomValue(submittedEditViewFormAtom);

  const fetch = useCallback(
    async (value: LineView): Promise<void> => {
      try {
        handleIsLoading(true);
        const result = await window.ipcRenderer.invoke("fetchChartData", {
          view: value,
        });

        handleChartProps(result);
      } catch (error) {
        console.error(error);
      } finally {
        handleIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleIsLoading を追加するよう指摘されるが、追加すると無限ループになるため無視 @fixme / view を追加されるよう指摘されるが、fetch が変わることはないので無視 @fixme
    [handleChartProps],
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
    isLoading,
  };
};
