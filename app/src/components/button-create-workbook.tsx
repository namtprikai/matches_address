import { AddFilled, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogBody,
  DialogActions,
  DialogContent,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useNavigate, type FormProps } from "react-router-dom";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { Input } from "./ui/input";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
  dialogBody: {
    gap: tokens.spacingVerticalL,
  },
});

export const ButtonCreateWorkbook = (): JSX.Element => {
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
        <Button
          icon={
            <AddFilled
              color={tokens.colorNeutralForeground1}
              fontSize={tokens.fontSizeBase400}
              strokeWidth={2}
            />
          }
          size="small"
        >
          新規ワークブック作成
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody className={styles.dialogBody}>
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
            ワークブック名
          </DialogTitle>
          <DialogContent>
            <Form id="create-workbook" onSubmit={handleSubmit}>
              <Input className={styles.input} name="title" />
            </Form>
          </DialogContent>
          <DialogActions>
            {/* <DialogTrigger> */}
            <Button
              appearance="primary"
              form="create-workbook"
              size="medium"
              type="submit"
            >
              保存
            </Button>
            {/* </DialogTrigger> */}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
