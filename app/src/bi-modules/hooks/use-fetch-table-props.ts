import { useCallback, useEffect, useState } from "react";
import { type TableProps } from "../../@types/charts";
import {
  usePagination,
  type UsePaginationReturnType,
} from "../../hooks/use-pagination";
import { type MapWithTableView, type TableView } from "../interfaces/view";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../../schema";
import { type OrderByQuery } from "../../@types/query";

type Params = {
  view: TableView | MapWithTableView;
  orderBy?: OrderByQuery<
    keyof SelectDataSetDetailArea | keyof SelectDataSetDetailBuilding
  > | null;
};

type ReturnType = {
  tableProps: TableProps;
  refetch: () => Promise<void>;
  pagination: UsePaginationReturnType;
};

export const useFetchTableProps = ({ view, orderBy }: Params): ReturnType => {
  const [tableProps, setTableProps] = useState<TableProps>({
    columns: [],
    data: [],
    totalCount: 0,
    allCount: 0,
  });
  const pagination = usePagination({
    total: tableProps.totalCount,
    perPage: 100,
  });

  const fetch = useCallback(async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("filterDataSetForTable", {
      view,
      pagination: {
        limit: pagination.limitPerPage,
        offset: pagination.limitPerPage * (pagination.page - 1),
      },
      orderBy: orderBy ?? undefined,
    });
    setTableProps(result);
  }, [orderBy, pagination.limitPerPage, pagination.page, view]);

  useEffect(() => {
    fetch().catch(console.error);
  }, [fetch]);

  return {
    tableProps,
    refetch: fetch,
    pagination,
  };
};
