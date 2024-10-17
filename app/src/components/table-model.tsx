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
  Link as FUILink,
  mergeClasses,
  Dialog,
  Textarea,
  Caption1,
} from "@fluentui/react-components";
import { MoreVerticalRegular } from "@fluentui/react-icons";
import { Link } from "react-router-dom";

import { useState } from "react";
import { formatDate } from "../utils/format-date";
import { useFetchModelFiles } from "../hooks/use-fetch-model-files";
import {
  useDialogState,
  type ReturnUseDialogState,
} from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";
import { Input } from "./ui/input";

const useStyles = makeStyles({
  updatedAtHeaderCell: {
    tableLayout: "fixed",
    width: "140px",
  },
  createdAtHeaderCell: {
    tableLayout: "fixed",
    width: "140px",
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  tableHeaderRow: {
    border: "none",
  },
  tableHeaderCell: {
    fontWeight: tokens.fontWeightSemibold,
  },
  modelNotFound: {
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  menuItemButton: {
    justifyContent: "flex-start",
    padding: 0,
    fontWeight: "normal",
    width: "100%",
  },
  alert100: {
    color: "#C4314B",
  },
  moreVerticalButton: {
    width: "44px",
  },
});

export const TableModel = (): JSX.Element => {
  const styles = useStyles();

  const { data } = useFetchModelFiles();

  const editModelTitleDialogState = useDialogState(false);
  const editNoteDialogState = useDialogState(false);
  const deleteDialogState = useDialogState(false);

  if (data === undefined) return <></>;

  if (data.length === 0) {
    return (
      <p className={styles.modelNotFound}>現在表示できるモデルはありません</p>
    );
  }

  return (
    <Table>
      <TableHeader className={styles.tableHeader}>
        <TableRow className={styles.tableHeaderRow}>
          <TableHeaderCell className={styles.tableHeaderCell}>
            モデル名
          </TableHeaderCell>
          <TableHeaderCell className={styles.tableHeaderCell}>
            モデル説明文
          </TableHeaderCell>
          <TableHeaderCell
            className={mergeClasses(
              styles.createdAtHeaderCell,
              styles.tableHeaderCell,
            )}
          >
            作成日
          </TableHeaderCell>
          <TableHeaderCell
            className={mergeClasses(
              styles.updatedAtHeaderCell,
              styles.tableHeaderCell,
            )}
          >
            更新日
          </TableHeaderCell>
          <TableHeaderCell
            className={styles.moreVerticalButton}
          ></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Link to={`/analysis/model/${item.id}`}>
                <FUILink
                  as="span"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {item.file_name}
                </FUILink>
              </Link>
            </TableCell>
            <TableCell>
              <Caption1>{item.note}</Caption1>
            </TableCell>
            <TableCell>
              <Caption1>{formatDate(item.created_at)}</Caption1>
            </TableCell>
            <TableCell>
              <Caption1>{formatDate(item.updated_at)}</Caption1>
            </TableCell>
            <TableCell className={styles.actions}>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="subtle"
                    aria-label="詳細メニュー"
                    icon={<MoreVerticalRegular />}
                    shape="rounded"
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      onClick={() => editModelTitleDialogState.setIsOpen(true)}
                    >
                      モデル名の編集
                    </MenuItem>
                    <MenuItem
                      onClick={() => editNoteDialogState.setIsOpen(true)}
                    >
                      モデル説明文の編集
                    </MenuItem>
                    <MenuItem>削除</MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </TableCell>
            <EditModelTitleDialog
              dialogState={editModelTitleDialogState}
              initialTitle=""
              onSubmit={() => {
                /** @todo 編集処理 */
              }}
            />
            <EditNoteDialog
              dialogState={editNoteDialogState}
              initialNote=""
              onSubmit={() => {
                /** @todo 編集処理 */
              }}
            />
            <DeleteMenuWithDialog
              dialogState={deleteDialogState}
              onDelete={() => {
                /** @todo 削除処理 */
              }}
            />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/**
 * TableModelコンポーネントでのみ利用
 */
const EditModelTitleDialog = ({
  initialTitle,
  onSubmit,
  dialogState,
}: {
  initialTitle: string;
  onSubmit: (name: string) => void;
  dialogState: ReturnUseDialogState;
}): JSX.Element => {
  const [title, setTitle] = useState(initialTitle);
  const { isOpen, setIsOpen } = dialogState;

  return (
    <Dialog onOpenChange={(_, data) => setIsOpen(data.open)} open={isOpen}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>モデル名の編集</DialogTitle>
          <DialogContent>
            <Input
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%" }}
              value={title}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={() => onSubmit(title)}>
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

/**
 * TableModelコンポーネントでのみ利用
 */
const EditNoteDialog = ({
  initialNote,
  onSubmit,
  dialogState,
}: {
  initialNote: string;
  onSubmit: (note: string) => void;
  dialogState: ReturnUseDialogState;
}): JSX.Element => {
  const [note, setNote] = useState(initialNote);
  const { isOpen, setIsOpen } = dialogState;

  return (
    <Dialog onOpenChange={(_, data) => setIsOpen(data.open)} open={isOpen}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>モデル説明文の編集</DialogTitle>
          <DialogContent>
            <Textarea
              onChange={(e) => setNote(e.target.value)}
              style={{ width: "100%" }}
              value={note}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={() => onSubmit(note)}>
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

/**
 * TableModelコンポーネントでのみ利用
 */
const DeleteMenuWithDialog = ({
  onDelete,
  dialogState,
}: {
  onDelete: () => void;
  dialogState: ReturnUseDialogState;
}): JSX.Element => {
  const { isOpen, setIsOpen } = dialogState;

  return (
    <Dialog onOpenChange={(_, data) => setIsOpen(data.open)} open={isOpen}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>このモデルを削除しますか？</DialogTitle>
          <DialogContent>
            削除したモデルを復元することはできません
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onDelete}>
              削除
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
