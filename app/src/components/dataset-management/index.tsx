import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  useTableFeatures,
  useTableSelection,
  createTableColumn,
  TableSelectionCell,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowDownloadRegular,
  MoreVerticalRegular,
} from "@fluentui/react-icons";
import {
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "../ui/button";

const useStyles = makeStyles({
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalM,
  },
});

export type DataSet = {
  name: string;
  date: string;
};

export type DatasetListProps = {
  dataSets: DataSet[];
  onSelectionChange: Dispatch<SetStateAction<number>>;
};

export function DatasetList({
  dataSets,
  onSelectionChange,
}: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<DataSet>({ columnId: "name" }),
    createTableColumn<DataSet>({ columnId: "date" }),
  ];

  const {
    getRows,
    selection: {
      allRowsSelected,
      someRowsSelected,
      toggleAllRows,
      toggleRow,
      isRowSelected,
    },
  } = useTableFeatures(
    {
      columns,
      items: dataSets,
    },
    [
      useTableSelection({
        selectionMode: "multiselect",
      }),
    ],
  );

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);
    return {
      ...row,
      onClick: (e: MouseEvent) => {
        toggleRow(e, row.rowId);
        onSelectionChange((prev) => (selected ? prev - 1 : prev + 1));
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === " ") {
          e.preventDefault();
          toggleRow(e, row.rowId);
          onSelectionChange((prev) => (selected ? prev - 1 : prev + 1));
        }
      },
      selected,
      appearance: selected ? ("brand" as const) : ("none" as const),
    };
  });

  const handleToggleAll = (e: MouseEvent): void => {
    toggleAllRows(e);
    onSelectionChange(allRowsSelected ? 0 : dataSets.length);
  };

  const handleDownload = (): void => {
    // eslint-disable-next-line no-console -- for debug
    console.log("Download button clicked");
  };

  const handleMenu = (): void => {
    // eslint-disable-next-line no-console -- for debug
    console.log("Menu button clicked");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableSelectionCell
            checkboxIndicator={{ "aria-label": "Select all rows" }}
            checked={
              allRowsSelected ? true : someRowsSelected ? "mixed" : false
            }
            onClick={handleToggleAll}
          />
          <TableHeaderCell>データセット名</TableHeaderCell>
          <TableHeaderCell>アップデート日</TableHeaderCell>
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, selected, onClick, appearance }) => (
          <TableRow
            key={item.name}
            appearance={appearance}
            aria-selected={selected}
            onClick={onClick}
          >
            <TableSelectionCell
              checkboxIndicator={{ "aria-label": "Select row" }}
              checked={selected}
            />
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell className={styles.actions}>
              <Button
                appearance="subtle"
                aria-label="ダウンロード"
                icon={<ArrowDownloadRegular />}
                onClick={handleDownload}
              />
              <Button
                appearance="subtle"
                aria-label="詳細メニュー"
                icon={<MoreVerticalRegular />}
                onClick={handleMenu}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
