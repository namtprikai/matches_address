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
import {
  type data_set_detail_areas,
  type data_set_detail_buildings,
} from "../schema";
import { useFetchFilterDataSetForTable } from "../hooks/use-fetch-filtered-data-set-for-table";

const useStyles = makeStyles({
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
    width: "auto",
    whiteSpace: "nowrap",
  },
});

type TableViewProps = {
  resultId: number;
} & (
  | {
      type: "building";
      dataSetResult: typeof data_set_detail_buildings.$inferSelect;
      columns: (keyof typeof data_set_detail_buildings.$inferSelect)[];
    }
  | {
      type: "area";
      dataSetResult: typeof data_set_detail_areas.$inferSelect;
      columns: (keyof typeof data_set_detail_areas.$inferSelect)[];
    }
);

export const TableView = ({
  columns,
  resultId,
  type,
}: TableViewProps): JSX.Element => {
  const { tableProps } = useFetchFilterDataSetForTable({
    resultId,
    type,
    columns,
  });

  const styles = useStyles();

  return (
    <div>
      {/* FIXME: overflowが機能しない */}
      <Table className={styles.table}>
        <TableHeader className={styles.tableHeader}>
          <TableRow className={styles.tableHeaderRow}>
            {tableProps.columns.map((column, index) => {
              return (
                <TableHeaderCell key={index} className={styles.tableHeaderCell}>
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
  );
};
