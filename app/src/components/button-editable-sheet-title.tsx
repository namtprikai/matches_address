import { ArchiveRegular, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  makeStyles,
  tokens,
  Input,
} from "@fluentui/react-components";
import { useRef, useState } from "react";
import { type FormProps } from "react-router-dom";
import { useOnClickOutside } from "../hooks/use-on-click-outside";
import { type SelectResultSheet } from "../schema";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogActions } from "./ui/dialog-actions";
import { Button } from "./ui/button";

type Props = {
  resultSheet: Pick<SelectResultSheet, "id" | "title">;
};

const useStyles = makeStyles({
  root: {
    padding: tokens.spacingVerticalNone,
  },
});

export const ButtonEditableSheetTitle = ({
  resultSheet,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(resultSheet.title || "");
  const updateTitle = (): void => {
    if (title.length === 0) return; // 仮のバリデーション
    const asyncSubmit = async (): Promise<void> => {
      await window.ipcRenderer.invoke("updateResultSheets", {
        resultSheetId: resultSheet.id,
        value: { title },
      });
    };
    asyncSubmit()
      .catch(console.error)
      .finally(() => setIsEditing(false));
  };

  const handleSubmit: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    updateTitle();
  };

  const ref = useRef(null);
  useOnClickOutside(ref, () => updateTitle());

  if (isEditing) {
    return (
      <form ref={ref} onSubmit={handleSubmit}>
        <Input
          maxLength={100}
          minLength={1}
          name="title"
          onChange={(e): void => setTitle(e.target.value)}
          size="small"
          value={title}
        />
        <Dialog>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="subtle" icon={<ArchiveRegular />} />
          </DialogTrigger>
          <DialogSurface>
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
                シートを削除しますか？
              </DialogTitle>
              <DialogContent>削除したシートはもとに戻せません</DialogContent>
              <DialogActions position="start">
                <Button>キャンセル</Button>
              </DialogActions>
              <DialogActions position="end">
                <Button appearance="primary">削除</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </form>
    );
  }

  return (
    <Button
      appearance="subtle"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- block要素にするのが目的。期待通りの動作をしているため無視。本来はaかbuttonのみ許容するよう。
      /* @ts-ignore */
      as="div"
      className={styles.root}
      onDoubleClick={(): void => setIsEditing(true)}
      shape="square"
      style={{
        lineHeight: "24px",
        padding: 0,
        margin: 0,
        minWidth: "auto",
      }}
    >
      {title}
    </Button>
  );
};
