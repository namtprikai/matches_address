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
  type MouseEvent,
  type KeyboardEvent,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { type KeyedMutator } from "swr";
import { Button } from "../ui/button";
import { type SelectRawDataSet } from "../../schema";
import { useFetchRawDatasets } from "../../hooks/use-fetch-raw-datasets";
import { formatDate } from "../../utils/format-date";
import { useDialogState } from "../../hooks/use-dialog-state";
import { downloadDataSetFile } from "../../utils/download-data-set-file";
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

type Props = {
  onSelectionChange: Dispatch<SetStateAction<SelectRawDataSet["id"][]>>;
};

export function RawDataSetTable({ onSelectionChange }: Props): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<SelectRawDataSet>({ columnId: "name" }),
    createTableColumn<SelectRawDataSet>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>());
  const { data, mutate } = useFetchRawDatasets();

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
      items: data || [],
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
      allRowsSelected ? [] : data?.map((dataset) => dataset.id) || [],
    );
  };

  const handleDownload = async (id: SelectRawDataSet["id"]): Promise<void> => {
    try {
      const data = await window.ipcRenderer.invoke("selectRawDataset", {
        id,
      });
      if (!data) return;
      const buffer = await window.ipcRenderer.invoke("readDatasetFile", {
        fileName: data.file_path,
      });
      void downloadDataSetFile(buffer, data.file_name);
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
              <DataPreviewDialog
                datasetName={item.file_name}
                id={item.id}
                type="raw"
              />
            </TableCell>
            <TableCell>{formatDate(item.updated_at, "YYYY/MM/DD")}</TableCell>
            <TableCell className={styles.actions}>
              <Button
                appearance="subtle"
                aria-label="ダウンロード"
                icon={<ArrowDownloadRegular />}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDownload(item.id);
                }}
              />
              <RowMenu item={item} mutate={mutate} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RowMenu({
  item,
  mutate,
}: {
  item: SelectRawDataSet;
  mutate: KeyedMutator<SelectRawDataSet[]>;
}): JSX.Element {
  const editNameDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);
  // ファイル名と拡張子に分割
  // 拡張子ファイルを扱うのはシードデータのみっぽいので、いったんここだけ対応する
  const { name, ext } = (() => {
    if (!item.file_name) {
      return { name: "", ext: "" };
    }
    if (item.file_name.indexOf(".") === -1) {
      return { name: item.file_name, ext: "" };
    }
    const [name, ext] = item.file_name.split(".");
    return { name, ext };
  })();

  const handleEditMenuClick = async (
    id: SelectRawDataSet["id"],
    newFileName: SelectRawDataSet["file_name"],
  ): Promise<void> => {
    const fullFileName = newFileName + (ext ? `.${ext}` : "");
    await window.ipcRenderer.invoke("updateRawDataset", {
      id,
      fileName: fullFileName,
    });
    void mutate(
      (data) =>
        data?.map((d) => (d.id === id ? { ...d, file_name: fullFileName } : d)),
      false, // すでにDBと同期が取れているので、再検証は不要（false）
    );
  };

  const handleDeleteMenuClick = (id: SelectRawDataSet["id"]): void => {
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
        initialName={name}
        onSubmit={(newFileName) => handleEditMenuClick(item.id, newFileName)}
      />
      <DeleteRowDialog
        dialogState={deleteDialogState}
        onDelete={() => handleDeleteMenuClick(item.id)}
      />
    </>
  );
}
