import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  makeStyles,
  tokens,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  useTableFeatures,
  useTableSelection,
  type TableRowId,
  createTableColumn,
  TableSelectionCell,
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
  useState,
  useEffect,
} from "react";
import { Button } from "../ui/button";
import { useDialogState } from "../../hooks/use-dialog-state";
import { DataPreviewDialog } from "./data-preview-dialog";
import { EditNameDialog } from "./edit-name-dialog";
import { DeleteRowDialog } from "./delete-row-dialog";

const useStyles = makeStyles({
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalM,
  },
  checkboxTh: {
    width: "44px",
  },
  menuItemButton: {
    justifyContent: "flex-start",
    padding: 0,
    fontWeight: "normal",
  },
  input: {
    width: "100%",
  },
});

export type Dataset = {
  id: number;
  name: string;
  date: string;
};

export type DatasetListProps = {
  onSelectionChange: Dispatch<SetStateAction<Dataset["id"][]>>;
  onSubmit: (id: Dataset["id"], newName: string) => void;
  onDelete: (id: Dataset["id"]) => void;
};

export function NormalizedDataSetTable({
  onSelectionChange,
  onSubmit,
  onDelete,
}: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<Dataset>({ columnId: "name" }),
    createTableColumn<Dataset>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>());
  const datasets: Dataset[] = _dummyDataSetNormalizations;

  useEffect(
    function resetSelection() {
      setSelectedRows(new Set());
    },
    [datasets],
  );

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
      items: datasets,
    },
    [
      useTableSelection({
        selectionMode: "multiselect",
        selectedItems: selectedRows,
        onSelectionChange: (_, data) => setSelectedRows(data.selectedItems),
      }),
    ],
  );

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);

    return {
      ...row,
      onClick: (e: MouseEvent) => {
        toggleRow(e, row.rowId);
        onSelectionChange((prev) =>
          selected
            ? prev.filter((id) => id !== row.item.id)
            : [...prev, row.item.id],
        );
      },
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === " ") {
          e.preventDefault();
          toggleRow(e, row.rowId);
          onSelectionChange((prev) =>
            selected
              ? prev.filter((id) => id !== row.item.id)
              : [...prev, row.item.id],
          );
        }
      },
      selected,
      appearance: selected ? ("brand" as const) : ("none" as const),
    };
  });

  const handleToggleAll = (e: MouseEvent): void => {
    toggleAllRows(e);
    onSelectionChange(() =>
      allRowsSelected ? [] : datasets.map((dataset) => dataset.id),
    );
  };

  // TODO: バックエンド処理
  const handleDownload = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      const response = await fetch("/dummy-data.csv");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dummy-data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("ダウンロードに失敗しました。");
    }
  };

  return (
    <Table>
      <TableHeader className={styles.tableHeader}>
        <TableRow>
          <TableSelectionCell
            checkboxIndicator={{ "aria-label": "Select all rows" }}
            checked={
              allRowsSelected ? true : someRowsSelected ? "mixed" : false
            }
            onClick={handleToggleAll}
          />
          <TableHeaderCell>データセット名</TableHeaderCell>
          <TableHeaderCell>アップロード日</TableHeaderCell>
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, selected, onClick, appearance }) => (
          <TableRow
            key={item.id}
            appearance={appearance}
            aria-selected={selected}
            onClick={onClick}
          >
            <TableSelectionCell
              checkboxIndicator={{ "aria-label": "Select row" }}
              checked={selected}
            />
            <TableCell>
              <DataPreviewDialog datasetName={item.name} />
            </TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell className={styles.actions}>
              <Button
                appearance="subtle"
                aria-label="ダウンロード"
                icon={<ArrowDownloadRegular />}
                onClick={handleDownload}
              />
              <RowMenu item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RowMenu({ item }: { item: Dataset }): JSX.Element {
  const editNameDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);

  const handleEditMenuClick = (
    id: Dataset["id"],
    newName: Dataset["name"],
  ): void => {
    // TODO: バックエンド処理
  };

  const handleDeleteMenuClick = (id: Dataset["id"]): void => {
    // TODO: バックエンド処理
  };

  return (
    <>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            aria-label="詳細メニュー"
            icon={<MoreVerticalRegular />}
            onClick={(e) => e.stopPropagation()}
          />
        </MenuTrigger>
        <MenuPopover onClick={(e) => e.stopPropagation()}>
          <MenuList>
            <MenuItem
              onClick={() => {
                editNameDialogState.setIsOpen(true);
              }}
            >
              データ名の編集
            </MenuItem>
            <MenuItem
              onClick={() => {
                deleteDialogState.setIsOpen(true);
              }}
            >
              削除
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <EditNameDialog
        dialogState={editNameDialogState}
        initialName={item.name}
        onSubmit={(newName) => handleEditMenuClick(item.id, newName)}
      />
      <DeleteRowDialog
        dialogState={deleteDialogState}
        onDelete={() => handleDeleteMenuClick(item.id)}
      />
    </>
  );
}

const _dummyDataSetNormalizations: Dataset[] = [
  { id: 1, name: "正規化済みデータ", date: "2024/4/21" },
  { id: 2, name: "水道メーター1.shp", date: "2024/4/21" },
  { id: 3, name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { id: 4, name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { id: 5, name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { id: 6, name: "水道メーター2.shp", date: "2024/4/21" },
];
