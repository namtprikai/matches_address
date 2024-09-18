import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Link as FUILink,
  tokens,
  makeStyles,
  mergeClasses,
} from "@fluentui/react-components";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { formatDate } from "../utils/format-date";
import { type SelectWorkbook } from "../schema";

const useStyles = makeStyles({
  updatedAtHeaderCell: {
    tableLayout: "fixed",
    width: "140px",
  },
  updatedAtCell: {
    fontSize: tokens.fontSizeBase200,
  },
  createdAtHeaderCell: {
    tableLayout: "fixed",
    width: "140px",
  },
  createdAtCell: {
    fontSize: tokens.fontSizeBase200,
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  tableHeaderRow: {
    border: "none",
  },
  tableHeaderCell: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

const fetcher = (): Promise<SelectWorkbook[]> => {
  const result = window.ipcRenderer.invoke("selectWorkbooks");
  return result;
};

export const TableWorkbook = (): JSX.Element => {
  const { data } = useSWR("TableWorkbook-selectWorkbooks", fetcher);
  const styles = useStyles();

  return (
    <Table>
      <TableHeader className={styles.tableHeader}>
        <TableRow className={styles.tableHeaderRow}>
          <TableHeaderCell className={styles.tableHeaderCell}>
            名前
          </TableHeaderCell>
          <TableHeaderCell
            className={mergeClasses(
              styles.createdAtHeaderCell,
              styles.tableHeaderCell,
            )}
          >
            作成日
          </TableHeaderCell>
          <TableHeaderCell
            className={mergeClasses(
              styles.updatedAtHeaderCell,
              styles.tableHeaderCell,
            )}
          >
            更新日
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link to={`/analysis/workbook/${item.id}`}>
                <FUILink
                  as="span"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {item.title}
                </FUILink>
              </Link>
            </TableCell>
            <TableCell className={styles.createdAtCell}>
              {formatDate(item.created_at)}
            </TableCell>
            <TableCell className={styles.updatedAtCell}>
              {formatDate(item.updated_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
