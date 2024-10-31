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
  useState,
} from "react";
import { Button } from "../ui/button";
import { type SelectNormalizedDataSet } from "../../schema";
import { useFetchNormalizedDatasets } from "../../hooks/use-fetch-normalized-datasets";
import { formatDate } from "../../utils/format-date";
import { useDialogState } from "../../hooks/use-dialog-state";
import { downloadDataSetFile } from "../../utils/download-data-set-file";
import { useFetchRawOrNormalizedDataSetFile } from "../../hooks/use-fetch-raw-data-set-file";
import { usePagination } from "../../hooks/use-pagination";
import { Pagination } from "../ui/pagination";
import { DataPreviewDialog } from "./data-preview-dialog";
import { EditNameDialog } from "./edit-name-dialog";
import { DeleteRowDialog } from "./delete-row-dialog";
import { DataPreviewTable } from "./data-preview-table";

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
  dataPreviewTableContainer: {
    marginTop: tokens.spacingVerticalS,
  },
});

type Props = {
  onSelectionChange: Dispatch<SetStateAction<SelectNormalizedDataSet["id"][]>>;
};

export function NormalizedDataSetTable({
  onSelectionChange,
}: Props): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<SelectNormalizedDataSet>({ columnId: "name" }),
    createTableColumn<SelectNormalizedDataSet>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>());
  const { data, mutate } = useFetchNormalizedDatasets();

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

  const handleDelete = (id: SelectNormalizedDataSet["id"]): void => {
    window.ipcRenderer
      .invoke("deleteNormalizedDataset", {
        id,
      })
      .then(() => {
        void mutate();
        setSelectedRows(new Set());
        onSelectionChange([]);
      })
      .catch(console.error);
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
        {rows.map((row) => (
          <Row
            {...row}
            key={row.item.id}
            onDelete={() => handleDelete(row.item.id)}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface RowProps {
  item: SelectNormalizedDataSet;
  selected: boolean;
  appearance: "brand" | "none";
  onClick: (e: MouseEvent) => void;
  onDelete: () => void;
}

function Row({
  item,
  selected,
  appearance,
  onClick,
  onDelete,
}: RowProps): JSX.Element {
  const styles = useStyles();
  const dataPreviewDialogState = useDialogState(false);
  const pagination = usePagination(50);
  const { data } = useFetchRawOrNormalizedDataSetFile({
    id: item.id,
    type: "normalized",
    page: pagination.page,
    limitPerPage: pagination.limitPerPage,
  });

  const handleDownload = async (): Promise<void> => {
    try {
      const data = await window.ipcRenderer.invoke("selectNormalizedDataSet", {
        id: item.id,
      });
      if (!data) return;
      const buffer = await window.ipcRenderer.invoke("readDatasetFile", {
        fileName: data.file_path,
      });
      void downloadDataSetFile(buffer, data.file_name || "");
    } catch (error) {
      console.error("Download failed:", error);
      alert("ダウンロードに失敗しました。");
    }
  };

  return (
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
          content={
            <div>
              <Pagination {...pagination} />
              <div className={styles.dataPreviewTableContainer}>
                <DataPreviewTable data={data} />
              </div>
            </div>
          }
          datasetName={item.file_name}
          dialogState={dataPreviewDialogState}
          onDelete={onDelete}
          onDownload={async () => {
            await handleDownload();
          }}
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
            void handleDownload();
          }}
        />
        <RowMenu item={item} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}

function RowMenu({
  item,
  onDelete,
}: {
  item: SelectNormalizedDataSet;
  onDelete: () => void;
}): JSX.Element {
  const editNameDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);
  const { mutate } = useFetchNormalizedDatasets();

  const handleEditName = async (
    newFileName: SelectNormalizedDataSet["file_name"],
  ): Promise<void> => {
    await window.ipcRenderer.invoke("updateNormalizedDataset", {
      id: item.id,
      fileName: newFileName,
    });
    void mutate();
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
        initialName={item.file_name}
        onSubmit={handleEditName}
      />
      <DeleteRowDialog
        dialogState={deleteDialogState}
        fileName={item.file_name || ""}
        onDelete={onDelete}
      />
    </>
  );
}
