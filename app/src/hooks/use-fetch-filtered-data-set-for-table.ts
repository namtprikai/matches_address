import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../@types/charts";
import { type SelectDataSetDetailBuilding } from "../schema";

export const useFetchFilterDataSetForTable = ({
  resultId,
  type,
  columns,
}: { resultId: number } & (
  | { type: "building"; columns: (keyof SelectDataSetDetailBuilding)[] }
  | { type: "area"; columns: (keyof SelectDataSetDetailBuilding)[] }
)): {
  tableProps: TableProps;
  refetch: () => Promise<void>;
} => {
  const [props, setProps] = useState<TableProps>({ columns: [], data: [] });

  const fetchFilteredDataSetDetailForTable =
    useCallback(async (): Promise<void> => {
      const result = await window.ipcRenderer.invoke("filterDataSetForTable", {
        resultId,
        type,
        columns,
      });
      setProps(result);
    }, [resultId, type, columns]);

  useEffect(() => {
    fetchFilteredDataSetDetailForTable().catch(console.error);
  }, [fetchFilteredDataSetDetailForTable]);

  if (type === "building") {
    return { tableProps: props, refetch: fetchFilteredDataSetDetailForTable };
  }

  return {
    tableProps: props,
    refetch: async () => {
      return;
    },
  };
};
