import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { DialogBody } from "../ui/dialog-body";
import { DialogContent } from "../ui/dialog-content";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const useStyles = makeStyles({
  menuItemButton: {
    justifyContent: "flex-start",
    padding: 0,
    fontWeight: "normal",
  },
  input: {
    width: "100%",
  },
});

interface Props {
  initialName: string;
  onSubmit: (newName: string) => void;
}

export function EditNameDialog({ initialName, onSubmit }: Props): JSX.Element {
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
