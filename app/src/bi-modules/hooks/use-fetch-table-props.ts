import { useCallback, useEffect, useState } from "react";
import { type SortDirection } from "@fluentui/react-components";
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

type Params = {
  view: TableView | MapWithTableView;
  orderBy?: {
    column:
      | keyof SelectDataSetDetailBuilding
      | keyof SelectDataSetDetailArea /** @note 最下層(filterDataSetForTable)でアサーションしてるせいであまり意味のない指定になっている */;
    direction: SortDirection;
  } | null;
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
