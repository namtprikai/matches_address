import { type CSSProperties, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import dayjs from "dayjs";
import { type workbooks } from "../schema";

type Workbook = typeof workbooks.$inferSelect;

const StyleOfUpdatedAtHeaderCell: CSSProperties = {
  tableLayout: "fixed",
  width: "140px",
};

const StyleOfUpdatedAtCell: CSSProperties = {
  fontSize: "12px",
};

const StyleOfCreatedAtHeaderCell: CSSProperties = {
  tableLayout: "fixed",
  width: "140px",
};

const StyleOfCreatedAtCell: CSSProperties = {
  fontSize: "12px",
};

export const TableWorkbook = (): JSX.Element => {
  const [data, setData] = useState<Workbook[]>([]);
  const fetchData = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectWorkbooks");
    setData(result);
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableHeaderCell>名前</TableHeaderCell>
        <TableHeaderCell style={StyleOfCreatedAtHeaderCell}>
          作成日
        </TableHeaderCell>
        <TableHeaderCell style={StyleOfUpdatedAtHeaderCell}>
          更新日
        </TableHeaderCell>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell style={StyleOfCreatedAtCell}>
              {dayjs(item.created_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
            <TableCell style={StyleOfUpdatedAtCell}>
              {dayjs(item.updated_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
