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
import {
  type ReturnUseDialogState,
  useDialogState,
} from "../../hooks/use-dialog-state";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogContent } from "../ui/dialog-content";
import { DialogActions } from "../ui/dialog-actions";
import { DialogSurface } from "../ui/dialog-surface";
import { downloadObjectsAsCSV } from "../../utils/download-objects-as-csv";
import { DeleteRowDialog } from "./delete-row-dialog";
import { EditNameDialog } from "./edit-name-dialog";
import { DataPreviewDialog } from "./data-preview-dialog";

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
  datasetButton: {
    padding: 0,
    justifyContent: "flex-start",
    color: tokens.colorBrandForeground1,
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "none",
    },
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
            mutate={mutate}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface RowProps {
  onClick: (e: MouseEvent) => void;
  selected: boolean;
  appearance: "brand" | "none";
  item: SelectDataSetResult;
  mutate: KeyedMutator<SelectDataSetResult[]>;
  onSelectionChange: Props["onSelectionChange"];
}

function Row({
  item,
  selected,
  onClick,
  appearance,
  mutate,
  onSelectionChange,
}: RowProps): JSX.Element {
  const styles = useStyles();
  const dataPreviewDialogState = useDialogState(false);

  // TODO: バックエンド処理
  const handleDownload = async (
    unit: Unit,
    id: SelectDataSetResult["id"],
    fileName: string,
  ): Promise<void> => {
    switch (unit) {
      case "building": {
        const data = await window.ipcRenderer.invoke(
          "fetchBuildingsInBatches",
          {
            dataSetResultId: id,
            batchSize: 100,
          },
        );
        if (!data) return;
        void downloadObjectsAsCSV(data, fileName);
        break;
      }
      case "area": {
        const data = await window.ipcRenderer.invoke("fetchAreasInBatches", {
          dataSetResultId: id,
          batchSize: 100,
        });
        if (!data) return;
        void downloadObjectsAsCSV(data, fileName);
        break;
      }
      default: {
        const exhaustiveCheck: never = unit;
        throw new Error(`Unhandled unit: ${exhaustiveCheck}`);
      }
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
        <SelectUnitDialog
          buttonText="プレビューを見る"
          dataPreviewProps={{
            onSubmit: () => {
              dataPreviewDialogState.setIsOpen(true);
            },
            id: item.id,
            dataPreviewDialogState,
            datasetName: item.title || "",
          }}
          title="データのプレビュー"
          triggerComponent={
            <Button
              appearance="transparent"
              className={styles.datasetButton}
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </Button>
          }
        />
      </TableCell>
      <TableCell>{formatDate(item.updated_at, "YYYY/MM/DD")}</TableCell>
      <TableCell className={styles.actions}>
        <SelectUnitDialog
          buttonText="ダウンロード"
          downloadProps={{
            onSubmit: (unit) => {
              void handleDownload(unit, item.id, item.title || "");
            },
          }}
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
  );
}

function SelectUnitDialog({
  triggerComponent,
  title,
  buttonText,
  downloadProps,
  dataPreviewProps,
}: {
  triggerComponent: ReactElement;
  title: string;
  buttonText: string;
  downloadProps?: {
    onSubmit: (unit: Unit) => void;
  };
  dataPreviewProps?: {
    onSubmit: (unit: Unit) => void;
    id: number;
    dataPreviewDialogState: ReturnUseDialogState;
    datasetName: string;
  };
}): JSX.Element {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit>("building");

  return (
    <>
      <Dialog
        onOpenChange={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        open={open}
      >
        <DialogTrigger disableButtonEnhancement>
          {triggerComponent}
        </DialogTrigger>
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
                    setSelectedUnit(data.value as "building" | "area")
                  }
                  value={selectedUnit}
                >
                  <Radio label="建物単位" value="building" />
                  <Radio label="地域単位" value="area" />
                </RadioGroup>
              </Field>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={() => {
                  downloadProps?.onSubmit(selectedUnit);
                  dataPreviewProps?.onSubmit(selectedUnit);
                  setOpen(false);
                }}
                size="medium"
              >
                {buttonText}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {dataPreviewProps ? (
        <DataPreviewDialog
          datasetName={dataPreviewProps.datasetName}
          dialogState={dataPreviewProps.dataPreviewDialogState}
          hideTrigger
          id={dataPreviewProps.id}
          type={selectedUnit}
        />
      ) : null}
    </>
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
    void mutate();
  };

  const handleDelete = async (id: SelectDataSetResult["id"]): Promise<void> => {
    await window.ipcRenderer.invoke("deleteDataSetResult", {
      id,
    });
    void mutate();
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
        fileName={item.title || ""}
        onDelete={() => handleDelete(item.id)}
      />
    </>
  );
}
