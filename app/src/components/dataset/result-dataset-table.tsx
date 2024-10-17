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
} from "react";
import { Button } from "../ui/button";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { type SelectDataSetResult } from "../../schema";
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

export type DatasetListProps = {
  onSelectionChange: Dispatch<SetStateAction<SelectDataSetResult["id"][]>>;
};

export function ResultDataSetTable({
  onSelectionChange,
}: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<SelectDataSetResult>({ columnId: "name" }),
    createTableColumn<SelectDataSetResult>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>());
  const { data } = useFetchDataSetResults();

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

  const handleEditMenuClick = (
    id: SelectDataSetResult["id"],
    newTitle: SelectDataSetResult["title"],
  ): void => {
    // TODO: バックエンド処理
  };

  const handleDeleteMenuClick = (id: SelectDataSetResult["id"]): void => {
    // TODO: バックエンド処理
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
              <DataPreviewDialog datasetName={item.title} />
            </TableCell>
            <TableCell>{item.updated_at}</TableCell>
            <TableCell className={styles.actions}>
              <Button
                appearance="subtle"
                aria-label="ダウンロード"
                icon={<ArrowDownloadRegular />}
                onClick={handleDownload}
              />
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="subtle"
                    aria-label="詳細メニュー"
                    icon={<MoreVerticalRegular />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem onClick={(e) => e.stopPropagation()}>
                      <EditNameDialog
                        initialName={item.title}
                        onSubmit={(newName) =>
                          handleEditMenuClick(item.id, newName)
                        }
                      />
                    </MenuItem>
                    <MenuItem onClick={(e) => e.stopPropagation()}>
                      <DeleteRowDialog
                        onDelete={() => handleDeleteMenuClick(item.id)}
                      />
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
