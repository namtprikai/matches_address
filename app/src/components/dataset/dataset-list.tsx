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
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Dialog,
  DialogTrigger,
  type TableRowId,
} from "@fluentui/react-components";
import {
  ArrowDownloadRegular,
  MoreVerticalRegular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import {
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
  type KeyboardEvent,
  useState,
  useEffect,
} from "react";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { DialogBody } from "../ui/dialog-body";
import { DialogContent } from "../ui/dialog-content";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const useStyles = makeStyles({
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalM,
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
  dataSets: Dataset[];
  onSelectionChange: Dispatch<SetStateAction<Dataset["id"][]>>;
  onSubmit: (id: Dataset["id"], newName: string) => void;
  onDelete: (id: Dataset["id"]) => void;
};

// TODO: ファイル名かコンポーネント名のどちらかを直して統一する
export function DatasetList({
  dataSets,
  onSelectionChange,
  onSubmit,
  onDelete,
}: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const columns = [
    createTableColumn<Dataset>({ columnId: "name" }),
    createTableColumn<Dataset>({ columnId: "date" }),
  ];
  const [selectedRows, setSelectedRows] = useState(
    () => new Set<TableRowId>([]),
  );

  useEffect(
    function resetSelection() {
      setSelectedRows(new Set());
    },
    [dataSets],
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
      items: dataSets,
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
      allRowsSelected ? [] : dataSets.map((dataset) => dataset.id),
    );
  };

  const handleDownload = (e: MouseEvent): void => {
    e.stopPropagation();
    // eslint-disable-next-line no-console -- for debug
    console.log("Download button clicked");
  };

  const handleEditMenuClick = (
    id: Dataset["id"],
    newName: Dataset["name"],
  ): void => {
    onSubmit(id, newName);
  };

  const handleDeleteMenuClick = (id: Dataset["id"]): void => {
    onDelete(id);
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
            key={item.id}
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
                      <EditDialog
                        initialName={item.name}
                        onSubmit={(newName) =>
                          handleEditMenuClick(item.id, newName)
                        }
                      />
                    </MenuItem>
                    <MenuItem onClick={(e) => e.stopPropagation()}>
                      <DeleteDialog
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

function EditDialog({
  initialName,
  onSubmit,
}: {
  initialName: string;
  onSubmit: (newName: string) => void;
}): JSX.Element {
  // TODO: 仮の動作確認のためのロジックなのでDBスキーマが決まりしだい修正する
  const styles = useStyles();
  const [newName, setNewName] = useState(initialName);
  const [open, setOpen] = useState(false);

  const handleSubmit = (): void => {
    onSubmit(newName);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={(_, data) => setOpen(data.open)} open={open}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="transparent"
          className={styles.menuItemButton}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          データ名の編集
        </Button>
      </DialogTrigger>
      <DialogSurface aria-describedby={undefined}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={
                    <Dismiss24Regular
                      color={tokens.colorNeutralForeground1}
                      strokeWidth={2}
                    />
                  }
                />
              </DialogTrigger>
            }
          >
            データ名の編集
          </DialogTitle>
          <DialogContent>
            <Input
              className={styles.input}
              onChange={(e) => setNewName(e.target.value)}
              value={newName}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={handleSubmit} size="medium">
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
function DeleteDialog({ onDelete }: { onDelete: () => void }): JSX.Element {
  const styles = useStyles();

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="transparent"
          className={styles.menuItemButton}
          onClick={(e) => e.stopPropagation()}
        >
          削除
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>このデータを削除しますか？</DialogTitle>
          <DialogContent>
            削除したデータを復元することはできません
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onDelete} size="medium">
              削除
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
