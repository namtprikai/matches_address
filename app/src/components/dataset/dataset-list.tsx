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
  Dialog,
  DialogTrigger,
  Checkbox,
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
  useState,
} from "react";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { DialogBody } from "../ui/dialog-body";
import { DialogContent } from "../ui/dialog-content";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  datasets: Dataset[];
  onSelectionChange: Dispatch<SetStateAction<Dataset["id"][]>>;
  onSubmit: (id: Dataset["id"], newName: string) => void;
  onDelete: (id: Dataset["id"]) => void;
};

// TODO: ファイル名かコンポーネント名のどちらかを直して統一する
export function DatasetList({
  datasets,
  onSelectionChange,
  onSubmit,
  onDelete,
}: DatasetListProps): JSX.Element {
  const styles = useStyles();

  const handleCheckboxChange = (id: Dataset["id"]): void => {
    onSelectionChange((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
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
      <TableHeader className={styles.tableHeader}>
        <TableRow>
          <TableHeaderCell className={styles.checkboxTh}></TableHeaderCell>
          <TableHeaderCell>データセット名</TableHeaderCell>
          <TableHeaderCell>アップデート日</TableHeaderCell>
          <TableHeaderCell></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datasets.map((dataset) => (
          <TableRow key={dataset.id}>
            <TableCell>
              <Checkbox onChange={() => handleCheckboxChange(dataset.id)} />
            </TableCell>
            <TableCell>
              <DataPreviewDialog datasetName={dataset.name} />
            </TableCell>
            <TableCell>{dataset.date}</TableCell>
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
                        initialName={dataset.name}
                        onSubmit={(newName) =>
                          handleEditMenuClick(dataset.id, newName)
                        }
                      />
                    </MenuItem>
                    <MenuItem onClick={(e) => e.stopPropagation()}>
                      <DeleteDialog
                        onDelete={() => handleDeleteMenuClick(dataset.id)}
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
