import { Link } from "react-router-dom";
import { makeStyles } from "@fluentui/react-components";
import useSWR from "swr";
import { formatDate } from "../utils/format-date";
import { type SelectWorkbook } from "../schema";
import { CustomTable, type ColumnDefinition } from "./ui/table";

const useStyles = makeStyles({
  link: {
    fontWeight: 600,
    color: "#0050b3",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  createdAtCell: {
    fontSize: "14px",
  },
  updatedAtCell: {
    fontSize: "14px",
  },
});

const fetcher = (): Promise<SelectWorkbook[]> => {
  return window.ipcRenderer.invoke("selectWorkbooks");
};

export const TableWorkbook = (): JSX.Element => {
  const { data } = useSWR("TableWorkbook-selectWorkbooks", fetcher);
  const styles = useStyles();

  const columns: ColumnDefinition<SelectWorkbook>[] = [
    {
      key: "title",
      name: "名前",
      onRender: (item) => (
        <Link className={styles.link} to={`/analysis/workbook/${item.id}`}>
          {item.title}
        </Link>
      ),
    },
    {
      key: "created_at",
      name: "作成日",
      width: "140px",
      className: styles.createdAtCell,
      onRender: (item) => formatDate(item.created_at),
    },
    {
      key: "updated_at",
      name: "更新日",
      width: "140px",
      className: styles.updatedAtCell,
      onRender: (item) => formatDate(item.updated_at),
    },
  ];

  return <CustomTable columns={columns} items={data || []} />;
};
