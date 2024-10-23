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
  Dialog,
  Field,
  Radio,
  RadioGroup,
  DialogTrigger,
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
  type ReactElement,
} from "react";
import { type KeyedMutator } from "swr";
import { Button } from "../ui/button";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { type SelectDataSetResult } from "../../schema";
import { formatDate } from "../../utils/format-date";
import { useDialogState } from "../../hooks/use-dialog-state";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogContent } from "../ui/dialog-content";
import { DialogActions } from "../ui/dialog-actions";
import { DialogSurface } from "../ui/dialog-surface";
import { DeleteRowDialog } from "./delete-row-dialog";
import { EditNameDialog } from "./edit-name-dialog";

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
  radioGroup: {
    marginTop: tokens.spacingVerticalM,
    marginLeft: "-8px",
  },
});

type Unit = "building" | "area";

type Props = {
  onSelectionChange: Dispatch<SetStateAction<SelectDataSetResult["id"][]>>;
};

export function ResultDataSetTable({ onSelectionChange }: Props): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<SelectDataSetResult>({ columnId: "name" }),
    createTableColumn<SelectDataSetResult>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>());
  const { data, mutate } = useFetchDataSetResults();

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
    const selected = isRowSelected(row.item.id);

    return {
      ...row,
      onClick: (e: MouseEvent) => {
        toggleRow(e, row.item.id);
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
              {/* TODO: 建物/地域を選択するダイアログを表示する */}
              {/* <DataPreviewDialog
                datasetName={item.title}
                id={item.id}
                type="result"
              /> */}
              {item.title}
            </TableCell>
            <TableCell>{formatDate(item.updated_at, "YYYY/MM/DD")}</TableCell>
            <TableCell className={styles.actions}>
              <SelectUnitDialog
                buttonText="ダウンロード"
                title="データのダウンロード"
                triggerComponent={
                  <Button
                    appearance="subtle"
                    aria-label="ダウンロード"
                    icon={<ArrowDownloadRegular />}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
              <RowMenu
                item={item}
                mutate={mutate}
                onSelectionChange={onSelectionChange}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SelectUnitDialog({
  triggerComponent,
  title,
  buttonText,
}: {
  triggerComponent: ReactElement;
  title: string;
  buttonText: string;
}): JSX.Element {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<Unit>("building");

  return (
    <Dialog
      onOpenChange={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
      open={open}
    >
      <DialogTrigger disableButtonEnhancement>{triggerComponent}</DialogTrigger>
      <DialogSurface onClick={(e) => e.stopPropagation()}>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <p>
              空き家判定結果データは以下の2つのデータが含まれます。
              どちらか選択してください。
            </p>
            <Field className={styles.radioGroup}>
              <RadioGroup
                onChange={(_, data) =>
                  setSelectedType(data.value as "building" | "area")
                }
                value={selectedType}
              >
                <Radio label="建物単位" value="building" />
                <Radio label="地域単位" value="area" />
              </RadioGroup>
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" size="medium">
              {buttonText}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function RowMenu({
  item,
  mutate,
  onSelectionChange,
}: {
  item: SelectDataSetResult;
  mutate: KeyedMutator<SelectDataSetResult[]>;
  onSelectionChange: Props["onSelectionChange"];
}): JSX.Element {
  const editNameDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);

  const handleEditName = async (
    id: SelectDataSetResult["id"],
    newTitle: SelectDataSetResult["title"],
  ): Promise<void> => {
    await window.ipcRenderer.invoke("updateDataSetResult", {
      id,
      title: newTitle,
    });
    void mutate(
      (data) => data?.map((d) => (d.id === id ? { ...d, title: newTitle } : d)),
      false, // すでにDBと同期が取れているので、再検証は不要（false）
    );
  };

  const handleDelete = async (id: SelectDataSetResult["id"]): Promise<void> => {
    await window.ipcRenderer.invoke("deleteDataSetResult", {
      id,
    });
    void mutate((data) => data?.filter((d) => d.id !== id), false);
    onSelectionChange((prev) => prev.filter((selectedId) => selectedId !== id));
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
        initialName={item.title}
        onSubmit={(newName) => handleEditName(item.id, newName)}
      />
      <DeleteRowDialog
        dialogState={deleteDialogState}
        onDelete={() => handleDelete(item.id)}
      />
    </>
  );
}
