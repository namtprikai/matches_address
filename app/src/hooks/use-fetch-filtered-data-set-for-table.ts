import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../@types/charts";
import { type FilterDataSetForTableArgs } from "../ipc-main-listeners/filter-data-set-for-table";
import { usePagination, type UsePaginationReturnType } from "./use-pagination";

type ReturnType = {
  tableProps: TableProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
};

export const useFetchFilterDataSetForTable = (
  props: Omit<FilterDataSetForTableArgs, "limit" | "offset">,
): ReturnType => {
  const [tableProps, setTableProps] = useState<TableProps>({
    columns: [],
    data: [],
  });

  const pagination = usePagination(100);

  const fetchFilteredDataSetDetailForTable =
    useCallback(async (): Promise<void> => {
      // @ts-expect-error -- props.typeのunion discriminationがspread構文を利用すると効かないため関数そのものリファククタも含め検討
      const result = await window.ipcRenderer.invoke("filterDataSetForTable", {
        ...props,
        limit: pagination.limitPerPage,
        offset: pagination.limitPerPage * (pagination.page - 1),
      });
      setTableProps(result);
    }, [pagination.limitPerPage, pagination.page, props]);

  useEffect(() => {
    fetchFilteredDataSetDetailForTable().catch(console.error);
  }, [fetchFilteredDataSetDetailForTable]);

  return {
    tableProps,
    refetch: async () => {
      return;
    },
    pagination,
  };
};
