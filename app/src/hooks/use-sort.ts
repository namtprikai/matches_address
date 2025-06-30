import {
  type SortDirection,
  type TableColumnId,
  useTableFeatures,
  useTableSort,
} from "@fluentui/react-components";

type HeaderSortProps = (columnId: TableColumnId) => {
  onClick: (e: React.MouseEvent) => void;
  sortDirection: SortDirection | undefined;
};

type UseSortReturnType<T> = {
  headerSortProps: HeaderSortProps;
  orderBy: {
    column: T;
    direction: SortDirection;
  } | null;
};

export const useSort = <T>(): UseSortReturnType<T> => {
  const {
    sort: { getSortDirection, toggleColumnSort, sortColumn, sortDirection },
  } = useTableFeatures<T>(
    {
      columns: [],
      items: [],
    },
    [useTableSort({})],
  );

  const headerSortProps: HeaderSortProps = (columnId) => ({
    onClick: (e) => {
      toggleColumnSort(e, columnId);
    },
    sortDirection: getSortDirection(columnId),
  });

  const orderBy = sortColumn
    ? {
        column: sortColumn as T,
        direction: sortDirection,
      }
    : null;

  return {
    headerSortProps,
    orderBy,
  };
};
