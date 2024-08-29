import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import {
  type data_set_detail_areas,
  type data_set_detail_buildings,
} from "../schema";
import { useFetchFilterDataSetForTable } from "../hooks/use-fetch-filtered-data-set-for-table";

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {tableProps.columns.map((column, index) => {
            return (
              <TableHeaderCell key={index}>{column.label}</TableHeaderCell>
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
                  return <TableCell key={index}>{row[column.key]}</TableCell>;
                })}
              </TableRow>
            );
          })
          .flat(-1)}
      </TableBody>
    </Table>
  );
};
