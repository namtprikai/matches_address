import { Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";
import { useState } from "react"; // useState をインポート
import { type FormProps } from "react-router-dom";
import { type ReturnUseDialogState } from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { Input } from "./ui/input";
import { DialogActions } from "./ui/dialog-actions";
import { DialogBody } from "./ui/dialog-body";
import { DialogContent } from "./ui/dialog-content";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
  button: {
    borderRadius: "100px",
    height: "32px",
    padding: `5px ${tokens.spacingHorizontalXL}`,
  },
  saveWithName: {
    border: 0,
    backgroundColor: "#09583B",
    color: "#fff",
  },
  DialogBody: {
    width: "449px",
  },
});

type Props = {
  filePath: string;
  jobId: number;
  jobResultsId: number;
  dialogState: ReturnUseDialogState;
};

export const DialogSaveWithName = ({
  filePath,
  jobId,
  jobResultsId,
  dialogState,
}: Props): JSX.Element => {
  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  const styles = useStyles();
  const [inputValue, setInputValue] = useState<string>(""); // 入力値の状態を管理

  /** フォーム制御についてはあとで考える */
  const handleSubmit: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    // フォーム送信時の処理をここに記述
    (async () => {
      await window.ipcRenderer.invoke("createNormalizedDatasets", {
        jobId,
        insertParams: {
          file_name: inputValue,
          file_path: filePath,
          job_results_id: jobResultsId,
        },
      });
      setIsDialogOpen(false);
      setInputValue("");
    })().catch(console.error);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button className={mergeClasses(styles.button, styles.saveWithName)}>
          名前をつけて保存
        </Button>
      </DialogTrigger>
      <DialogSurface className={styles.DialogBody}>
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
            名前をつけて保存
          </DialogTitle>
          <DialogContent>
            <Form id="save-with-name" onSubmit={handleSubmit}>
              <Input
                className={styles.input}
                name="title"
                onChange={handleInputChange}
                placeholder="OO年度前処理済みデータ"
                value={inputValue}
              />
            </Form>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              disabled={inputValue.trim() === ""}
              form="save-with-name"
              size="medium"
              type="submit"
            >
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
