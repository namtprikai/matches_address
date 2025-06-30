import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
} from "@fluentui/react-components";
import { Pagination } from "../ui/pagination";
import { type TableView } from "../../bi-modules/interfaces/view";
import { useFetchTableProps } from "../../bi-modules/hooks/use-fetch-table-props";
import { useSort } from "../../hooks/use-sort";
import { type SelectDataSetDetailBuilding } from "../../schema";
import { QueryHeaderWithPagination } from "./query-header";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: `${tokens.spacingVerticalS}`,
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  tableHeaderRow: {
    border: "none",
  },
  tableHeaderCell: {
    fontWeight: tokens.fontWeightSemibold,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  table: {
    tableLayout: "auto",
  },
  tableContainer: {
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
});

type Props = {
  view: TableView;
};

export const ViewTable = ({ view }: Props): JSX.Element => {
  const { orderBy, headerSortProps } =
    useSort<keyof SelectDataSetDetailBuilding>();

  const { tableProps, pagination } = useFetchTableProps({
    view,
    orderBy,
  });

  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <QueryHeaderWithPagination
          allCount={tableProps.allCount}
          currentDataLength={tableProps.data.length}
          pagination={pagination}
        />
        <Pagination {...pagination} />
      </div>
      <div className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHeader className={styles.tableHeader}>
            <TableRow className={styles.tableHeaderRow}>
              {tableProps.columns.map((column, index) => {
                return (
                  <TableHeaderCell
                    key={index}
                    className={styles.tableHeaderCell}
                    {...headerSortProps(column.key)}
                  >
                    {column.label}
                  </TableHeaderCell>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableProps.data
              .map((row, index) => {
                return (
                  <TableRow key={index}>
                    {tableProps.columns.map((column, index) => {
                      return (
                        <TableCell key={index}>
                          {row[column.key]}
                          {column.unit ?? ""}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
              .flat(-1)}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
