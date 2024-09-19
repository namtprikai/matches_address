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
import { useLocation } from "react-router-dom";
import { useFetchFilterDataSetForTable } from "../hooks/use-fetch-filtered-data-set-for-table";
import { type FilterDataSetForTableArgs } from "../ipc-main-listeners/filter-data-set-for-table";
import { Pagenation } from "./ui/pagenation";

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
  tableContainerEdit: {
    width: "calc(100vw - 82px - 320px - 48px - 44px)",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
  tableContainer: {
    width: "calc(100vw - 82px - 48px - 44px)",
    overflowX: "scroll",
    whiteSpace: "nowrap",
  },
});

type TableViewProps = FilterDataSetForTableArgs;

export const TableView = (
  props: Omit<TableViewProps, "limit" | "offset">,
): JSX.Element => {
  const { tableProps, pagenation } = useFetchFilterDataSetForTable(props);

  const pathname = useLocation().pathname;
  const isEdit = pathname.includes("edit");

  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Pagenation {...pagenation} />
      <div
        className={isEdit ? styles.tableContainerEdit : styles.tableContainer}
      >
        <Table className={styles.table}>
          <TableHeader className={styles.tableHeader}>
            <TableRow className={styles.tableHeaderRow}>
              {tableProps.columns.map((column, index) => {
                return (
                  <TableHeaderCell
                    key={index}
                    className={styles.tableHeaderCell}
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
