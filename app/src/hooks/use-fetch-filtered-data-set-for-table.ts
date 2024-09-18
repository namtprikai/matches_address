import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../@types/charts";
import { type SelectDataSetDetailBuilding } from "../schema";
import { usePagenation, type UsePagenationReturnType } from "./use-pagenation";

type Params = {
  resultId: number;
  filterByYear: {
    startValue: number | undefined;
    endValue: number | undefined;
  };
} & (
  | { type: "building"; columns: (keyof SelectDataSetDetailBuilding)[] }
  | { type: "area"; columns: (keyof SelectDataSetDetailBuilding)[] }
);

type ReturnType = {
  tableProps: TableProps;
  refetch: () => Promise<void>;
  pagenation: UsePagenationReturnType;
};

export const useFetchFilterDataSetForTable = ({
  resultId,
  type,
  columns,
  filterByYear,
}: Params): ReturnType => {
  const [props, setProps] = useState<TableProps>({ columns: [], data: [] });

  const pagenation = usePagenation(100);

  const fetchFilteredDataSetDetailForTable =
    useCallback(async (): Promise<void> => {
      const result = await window.ipcRenderer.invoke("filterDataSetForTable", {
        resultId,
        type,
        columns: columns as [] /** @fixme 型エラーよけ */,
        filterByYear,
        limit: pagenation.limitPerPage,
        offset: pagenation.limitPerPage * (pagenation.page - 1),
      });
      setProps(result);
    }, [resultId, type, columns, filterByYear, pagenation]);

  useEffect(() => {
    fetchFilteredDataSetDetailForTable().catch(console.error);
  }, [fetchFilteredDataSetDetailForTable]);

  if (type === "building") {
    return {
      tableProps: props,
      refetch: fetchFilteredDataSetDetailForTable,
      pagenation,
    };
  }

  return {
    tableProps: props,
    refetch: async () => {
      return;
    },
    pagenation,
  };
};
