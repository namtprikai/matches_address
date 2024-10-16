import { Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";
import { useNavigate, type FormProps } from "react-router-dom";
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
});

export const DialogSaveWithName = (): JSX.Element => {
  const styles = useStyles();
  const navigate = useNavigate();

  /** フォーム制御についてはあとで考える */
  const handleSubmit: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    const asyncSubmit = async (): Promise<void> => {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const res = await window.ipcRenderer.invoke("createWorkbooks", {
        title: data.title.toString(),
      });
      navigate(`/analysis/workbook/${res.id}/edit`);
    };
    asyncSubmit().catch(console.error);
  };

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button className={mergeClasses(styles.button, styles.saveWithName)}>
          名前をつけて保存
        </Button>
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
            名前をつけて保存
          </DialogTitle>
          <DialogContent>
            <Form id="save-with-name" onSubmit={handleSubmit}>
              <Input
                className={styles.input}
                name="title"
                placeholder="OO年度前処理済みデータ"
              />
            </Form>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
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
