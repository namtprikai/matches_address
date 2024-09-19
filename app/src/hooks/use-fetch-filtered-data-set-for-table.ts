import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../@types/charts";
import { type FilterDataSetForTableArgs } from "../ipc-main-listeners/filter-data-set-for-table";
import { usePagenation, type UsePagenationReturnType } from "./use-pagenation";

type ReturnType = {
  tableProps: TableProps;
  refetch: () => Promise<void>;
  pagenation: UsePagenationReturnType;
};

export const useFetchFilterDataSetForTable = (
  props: Omit<FilterDataSetForTableArgs, "limit" | "offset">,
): ReturnType => {
  const [tableProps, setTableProps] = useState<TableProps>({
    columns: [],
    data: [],
  });

  const pagenation = usePagenation(100);

  const fetchFilteredDataSetDetailForTable =
    useCallback(async (): Promise<void> => {
      const result = await window.ipcRenderer.invoke("filterDataSetForTable", {
        ...props,
        limit: pagenation.limitPerPage,
        offset: pagenation.limitPerPage * (pagenation.page - 1),
      });
      setTableProps(result);
    }, [pagenation.limitPerPage, pagenation.page, props]);

  useEffect(() => {
    fetchFilteredDataSetDetailForTable().catch(console.error);
  }, [fetchFilteredDataSetDetailForTable]);

  return {
    tableProps,
    refetch: async () => {
      return;
    },
    pagenation,
  };
};
