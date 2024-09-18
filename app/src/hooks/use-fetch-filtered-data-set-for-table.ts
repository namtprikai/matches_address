import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../@types/charts";
import { type FilterDataSetForTableArgs } from "../ipc-main-listeners/filter-data-set-for-table";

export const useFetchFilterDataSetForTable = (
  props: FilterDataSetForTableArgs,
): {
  tableProps: TableProps;
  refetch: () => Promise<void>;
} => {
  const [tableProps, setTableProps] = useState<TableProps>({
    columns: [],
    data: [],
  });

  const fetchFilteredDataSetDetailForTable =
    useCallback(async (): Promise<void> => {
      const result = await window.ipcRenderer.invoke(
        "filterDataSetForTable",
        props,
      );
      setTableProps(result);
    }, [props]);

  useEffect(() => {
    fetchFilteredDataSetDetailForTable().catch(console.error);
  }, [fetchFilteredDataSetDetailForTable]);

  return {
    tableProps,
    refetch: async () => {
      return;
    },
  };
};
