import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  mergeClasses,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  tableHeader: {
    backgroundColor: "#f3f2f1",
  },
  tableHeaderRow: {
    border: "none",
  },
  tableHeaderCell: {
    fontWeight: "600",
  },
  tableBody: {
    backgroundColor: "#fff",
  },
});

export interface ColumnDefinition<T> {
  key: keyof T;
  name: string;
  className?: string;
  onRender?: (item: T) => React.ReactNode;
}

interface CustomTableProps<T> {
  columns: ColumnDefinition<T>[];
  items: T[];
}

export function CustomTable<T>({
  columns,
  items,
}: CustomTableProps<T>): JSX.Element {
  const styles = useStyles();

  return (
    <Table>
      <TableHeader className={styles.tableHeader}>
        <TableRow className={styles.tableHeaderRow}>
          {columns.map((column) => (
            <TableHeaderCell
              key={String(column.key)}
              className={mergeClasses(styles.tableHeaderCell, column.className)}
              style={{ width: "150px" }}
            >
              {column.name}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={styles.tableBody}>
        {items.map((item, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.onRender
                  ? column.onRender(item)
                  : (item[column.key] as React.ReactNode)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
