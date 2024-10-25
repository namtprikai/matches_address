import { Dialog, makeStyles, DialogTrigger } from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { useState } from "react";
import { type ReturnUseDialogState } from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";
import { Field } from "./ui/field";
import { Input } from "./ui/input";

const useStyles = makeStyles({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: "24px",
    height: "24px",
    ":hover": { cursor: "pointer" },
  },
  disabledButton: {
    backgroundColor: "#EFF0F0",
    color: "#89949F",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#EFF0F0",
    },
  },
  formContents: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});

/** 仮: もっと具体的に書けそうなら書く・書けなかったら普通にstringとして書く */
type DataType = Record<string, string | number>;

type Props = {
  dialogState: ReturnUseDialogState;
  onSelected: (data: DataType) => void;
};

export const DialogModelAdvanced = ({
  dialogState,
  onSelected,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [selectedData, setSelectedData] = useState<DataType>({});

  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  const handleClick = (): void => {
    onSelected(selectedData);
    setIsDialogOpen(false);
  };

  // 仮
  const disabled = false;

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={
                    <DismissFilled className={styles.icon} strokeWidth={2} />
                  }
                />
              </DialogTrigger>
            }
            className={styles.dialogTitle}
          >
            高度な設定を変更
          </DialogTitle>
          <DialogContent className={styles.formContents}>
            <Field label="Test Size">
              <Input
                onChange={() => {
                  // 仮
                  setSelectedData({ testSize: 0.2 });
                }}
              />
            </Field>
            <Field label="L1 Regularization">
              <Input
                onChange={() => {
                  // 仮
                  setSelectedData({ l1Regularization: 0.1 });
                }}
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              className={disabled ? styles.disabledButton : ""}
              disabled={disabled}
              onClick={handleClick}
            >
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
