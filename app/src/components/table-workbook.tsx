import { useEffect, useState } from "react";
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
        <TableHeaderCell>作成日</TableHeaderCell>
        <TableHeaderCell>更新日</TableHeaderCell>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell>
              {dayjs(item.created_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
            <TableCell>
              {dayjs(item.updated_at).format("YYYY/MM/DD HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
