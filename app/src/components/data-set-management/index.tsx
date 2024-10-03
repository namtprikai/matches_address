import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  makeStyles,
  tokens,
  useTableFeatures,
  useTableSelection,
  createTableColumn,
  TableSelectionCell,
} from "@fluentui/react-components";
import {
  ArrowDownloadRegular,
  MoreHorizontalRegular,
  DeleteRegular,
} from "@fluentui/react-icons";
import { type KeyboardEvent, type MouseEvent, useState } from "react";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  button: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    "&:hover, &:active, &:focus, &:focus-within": {
      border: `1px solid ${tokens.colorNeutralStroke1Selected}`,
    },
  },
  table: {
    marginTop: tokens.spacingVerticalL,
  },
});

export type DataSet = {
  name: string;
  date: string;
};

export type DatasetListProps = {
  dataSets: DataSet[];
};

export function DatasetList({ dataSets }: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const [selectedCount, setSelectedCount] = useState(0);

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
        setSelectedCount((prev) => (selected ? prev - 1 : prev + 1));
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === " ") {
          e.preventDefault();
          toggleRow(e, row.rowId);
          setSelectedCount((prev) => (selected ? prev - 1 : prev + 1));
        }
      },
      selected,
      appearance: selected ? ("brand" as const) : ("none" as const),
    };
  });

  const handleToggleAll = (e: MouseEvent): void => {
    toggleAllRows(e);
    setSelectedCount(allRowsSelected ? 0 : dataSets.length);
  };

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="primary">+ 新規アップロード</Button>
        <div className={styles.actions}>
          <span>{selectedCount}件選択中</span>
          <Button
            appearance="outline"
            className={styles.button}
            icon={<ArrowDownloadRegular />}
            shape="square"
          />
          <Button
            appearance="outline"
            className={styles.button}
            icon={<DeleteRegular />}
            shape="square"
          />
        </div>
      </div>
      <Table className={styles.table}>
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
          {rows.map(({ item, selected, onClick, onKeyDown, appearance }) => (
            <TableRow
              key={item.name + item.date}
              appearance={appearance}
              aria-selected={selected}
              onClick={onClick}
              onKeyDown={onKeyDown}
            >
              <TableSelectionCell
                checkboxIndicator={{ "aria-label": "Select row" }}
                checked={selected}
              />
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <Button
                  appearance="subtle"
                  aria-label="ダウンロード"
                  icon={<ArrowDownloadRegular />}
                />
                <Button
                  appearance="subtle"
                  aria-label="詳細メニュー"
                  icon={<MoreHorizontalRegular />}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
