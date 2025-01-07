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
import { downloadObjectsAsCSV } from "../../utils/download-objects-as-csv";
import {
  type ResultDataSetsResponse,
  useFetchResultDataSetsWithPagination,
} from "../../hooks/use-fetch-result-data-sets-with-pagination";
import { usePagination } from "../../hooks/use-pagination";
import { Pagination } from "../ui/pagination";
import { DeleteRowDialog } from "./delete-row-dialog";
import { EditNameDialog } from "./edit-name-dialog";
import { DataPreviewDialog } from "./data-preview-dialog";
import { DataPreviewTable } from "./data-preview-table";
import { ResultDataSetMetadata } from "./result-dataset-metadata";

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
    borderRadius: 0,
    textAlign: "left",
    "&:hover": {
      textDecoration: "none",
    },
  },
  dataPreviewTableContainer: {
    marginTop: tokens.spacingVerticalS,
  },
  radioGroup: {
    marginTop: tokens.spacingVerticalM,
    marginLeft: "-8px",
  },
});

export type ResultDataSetUnit = "building" | "area";

type Props = {
  selectedIds: SelectDataSetResult["id"][];
  onSelectionChange: Dispatch<SetStateAction<SelectDataSetResult["id"][]>>;
};

export function ResultDataSetTable({
  onSelectionChange,
  selectedIds,
}: Props): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<SelectDataSetResult>({ columnId: "name" }),
    createTableColumn<SelectDataSetResult>({ columnId: "date" }),
  ];
  const { data, mutate } = useFetchDataSetResults();

  const {
    getRows,
    selection: { toggleAllRows, toggleRow },
  } = useTableFeatures(
    {
      columns,
      items: data || [],
    },
    [
      useTableSelection({
        selectionMode: "multiselect",
        selectedItems: new Set(selectedIds.map(String)), // TableRowIdをstringに変換
      }),
    ],
  );

  const rows = getRows((row) => {
    const selected = selectedIds.includes(row.item.id);

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
    onSelectionChange((prev) =>
      prev.length === (data?.length || 0)
        ? []
        : data?.map((dataset) => dataset.id) || [],
    );
  };

  const handleDelete = async (id: SelectDataSetResult["id"]): Promise<void> => {
    try {
      await window.ipcRenderer.invoke("deleteRawDataset", { id });
      await mutate();
      onSelectionChange((prev) => prev.filter((prevId) => prevId !== id));
    } catch (error) {
      console.error("Delete operation failed:", error);
    }
  };

  const allSelected = data?.length === selectedIds.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < (data?.length || 0);

  return (
    <Table>
      <TableHeader className={styles.tableHeader}>
        <TableRow>
          <TableSelectionCell
            checkboxIndicator={{ "aria-label": "Select all rows" }}
            checked={allSelected ? true : someSelected ? "mixed" : false}
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
  item: SelectDataSetResult;
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
  const [selectedUnit, setSelectedUnit] =
    useState<ResultDataSetUnit>("building");
  const pagination = usePagination(50);
  const { data } = useFetchResultDataSetsWithPagination({
    dataSetResultId: item.id,
    type: selectedUnit,
    page: pagination.page,
    limitPerPage: pagination.limitPerPage,
  });

  // TODO: Pythonの処理を呼び出す
  const handleDownload = async (): Promise<void> => {
    switch (selectedUnit) {
      case "building": {
        const data = await window.ipcRenderer.invoke(
          "selectBuildingsInBatches",
          {
            dataSetResultId: item.id,
            batchSize: 100,
          },
        );
        if (!data) return;
        void downloadObjectsAsCSV(data, item.title || "");
        break;
      }
      case "area": {
        const data = await window.ipcRenderer.invoke("selectAreasInBatches", {
          dataSetResultId: item.id,
          batchSize: 100,
        });
        if (!data) return;
        void downloadObjectsAsCSV(data, item.title || "");
        break;
      }
      default: {
        const exhaustiveCheck: never = selectedUnit;
        throw new Error(`Unhandled unit: ${exhaustiveCheck}`);
      }
    }
  };

  return (
    <>
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
            dialogTriggerChildren={
              <Button
                appearance="transparent"
                className={styles.datasetButton}
                onClick={(e) => e.stopPropagation()}
              >
                {item.title}
              </Button>
            }
            onChange={(unit) => setSelectedUnit(unit)}
            onSubmit={() => {
              pagination.handlePageChange(1);
              pagination.handleLimitPerPageChange(50);
              dataPreviewDialogState.setIsOpen(true);
            }}
            title="データのプレビュー"
          />
          <DataPreviewDialog
            content={
              <div>
                <Pagination {...pagination} />
                <div className={styles.dataPreviewTableContainer}>
                  <DataPreviewTable data={parseResultDataSets(data)} />
                </div>
              </div>
            }
            datasetName={item.title}
            dialogState={dataPreviewDialogState}
            hideTrigger
            onDelete={onDelete}
            onDownload={async () => {
              await handleDownload();
            }}
          />
        </TableCell>
        <TableCell>{formatDate(item.updated_at, "YYYY/MM/DD")}</TableCell>
        <TableCell className={styles.actions}>
          <SelectUnitDialog
            buttonText="ダウンロード"
            dialogTriggerChildren={
              <Button
                appearance="subtle"
                aria-label="ダウンロード"
                icon={<ArrowDownloadRegular />}
                onClick={(e) => e.stopPropagation()}
              />
            }
            onChange={(unit) => setSelectedUnit(unit)}
            onSubmit={() => {
              void handleDownload();
            }}
            title="データのダウンロード"
          />
          <RowMenu item={item} onDelete={onDelete} />
        </TableCell>
      </TableRow>
    </>
  );
}

function SelectUnitDialog({
  title,
  buttonText,
  onChange,
  onSubmit,
  dialogTriggerChildren,
}: {
  title: string;
  buttonText: string;
  onChange: (unit: ResultDataSetUnit) => void;
  onSubmit: () => void;
  dialogTriggerChildren: ReactElement;
}): JSX.Element {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      onOpenChange={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
        onChange("building");
      }}
      open={open}
    >
      <DialogTrigger disableButtonEnhancement>
        {dialogTriggerChildren}
      </DialogTrigger>
      <DialogSurface onClick={(e) => e.stopPropagation()}>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <p>
              空き家推定結果データは以下の2つのデータが含まれます。
              どちらか選択してください。
            </p>
            <Field className={styles.radioGroup}>
              <RadioGroup
                defaultValue="building"
                onChange={(_, data) =>
                  onChange(data.value as "building" | "area")
                }
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
                onSubmit();
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
  );
}

function RowMenu({
  item,
  onDelete,
}: {
  item: SelectDataSetResult;
  onDelete: () => void;
}): JSX.Element {
  const editNameDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);
  const { mutate } = useFetchDataSetResults();

  const handleEditName = async (
    newTitle: SelectDataSetResult["title"],
  ): Promise<void> => {
    await window.ipcRenderer.invoke("updateDataSetResult", {
      id: item.id,
      title: newTitle,
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
        initialName={item.title}
        onSubmit={handleEditName}
      />
      <DeleteRowDialog
        dialogState={deleteDialogState}
        fileName={item.title || ""}
        onDelete={onDelete}
      />
    </>
  );
}

/**
 * 推定結果データのカラム名を日本語名に変換したり値に単位を付与したりする。
 * @param {any} data:ResultDataSetsResponse
 * @returns {any}
 */
function parseResultDataSets(
  data: ResultDataSetsResponse,
): ResultDataSetsResponse {
  if (!data) return data;

  const parsedData = data.map((row) => {
    const newRow: NonNullable<ResultDataSetsResponse>[number] = {};

    for (const enKey in row) {
      const value = row[enKey];
      type MetadataKey = keyof typeof ResultDataSetMetadata;
      const { label: jpKey, unit } =
        ResultDataSetMetadata[enKey as MetadataKey];

      if (unit === "%") {
        if (typeof value === "string" || value === null) {
          newRow[jpKey] = value;
          continue;
        }
        if (value === 0) {
          newRow[jpKey] = "0%";
          continue;
        }
        if (value !== 0 && value < 1) {
          newRow[jpKey] = `${(value * 100).toFixed(0)}${unit}`;
          continue;
        }
        if (value >= 1) {
          newRow[jpKey] = `${value.toFixed(0)}${unit}`;
          continue;
        }
      }
      newRow[jpKey] = unit ? `${value}${unit}` : value;
    }

    return newRow;
  });

  return parsedData;
}
