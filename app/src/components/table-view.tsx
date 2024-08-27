import {
  Table,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import { type TableViewProps } from "../@types/charts";

export const TableView = ({ columns, data }: TableViewProps): JSX.Element => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => {
            return (
              <TableHeaderCell key={index}>{column.label}</TableHeaderCell>
            );
          })}
        </TableRow>
      </TableHeader>
      {data
        .map((row, index) => {
          return (
            <TableRow key={index}>
              {columns.map((column, index) => {
                return <TableCell key={index}>{row[column.key]}</TableCell>;
              })}
            </TableRow>
          );
        })
        .flat(-1)}
    </Table>
  );
};
