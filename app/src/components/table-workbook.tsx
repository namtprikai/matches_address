import { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { type workbooks } from "../schema";

type Workbook = typeof workbooks.$inferSelect;

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

export const TableWorkbook = (): JSX.Element => {
  const [data, setData] = useState<Workbook[]>([]);
  const fetchData = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectWorkbooks");
    setData(result);
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

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
        {data.map((item) => (
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
              {dayjs(item.created_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
            <TableCell className={styles.updatedAtCell}>
              {dayjs(item.updated_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
