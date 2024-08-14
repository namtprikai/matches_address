import { AddFilled, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useNavigate, type FormProps } from "react-router-dom";
import { Button } from "./button";

const useStyles = makeStyles({
  input: {
    width: "100%",
  },
  title: {
    fontSize: tokens.fontSizeBase200,
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
          className={styles.title}
          icon={
            <AddFilled
              className={styles.addIcon}
              color={tokens.colorNeutralForeground1}
              fontSize={tokens.fontSizeBase400}
              width={2}
            />
          }
        >
          新規ワークブック作成
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
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            ワークブック名
          </DialogTitle>
          <DialogContent>
            <form id="create-workbook" onSubmit={handleSubmit}>
              <Input className={styles.input} name="title" />
            </form>
          </DialogContent>
          <DialogActions>
            {/* <DialogTrigger> */}
            <Button appearance="primary" form="create-workbook" type="submit">
              保存
            </Button>
            {/* </DialogTrigger> */}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
