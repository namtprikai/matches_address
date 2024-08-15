import { AddFilled, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogBody,
  DialogActions,
  DialogContent,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useNavigate, type FormProps } from "react-router-dom";
import { Button } from "./ui/button";
import { Form } from "./ui/form";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";

const useStyles = makeStyles({
  input: {
    width: "100%",
    "&:after": {
      display: "none",
    },
    padding: `${tokens.spacingVerticalSNudge} ${tokens.spacingHorizontalM}`,
    "& input": {
      padding: 0,
    },
  },
  title: {
    fontSize: tokens.fontSizeBase200,
  },
  dialogBody: {
    gap: tokens.spacingVerticalL,
  },
  closeButton: {
    padding: 0,
    width: "24px",
    height: "24px",
    minWidth: "24px",
    "& span > svg": {
      width: "20px",
      height: "20px",
    },
  },
  saveButton: {
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalL}`,
    fontSize: tokens.fontSizeBase300,
    border: "none",
    minWidth: "80px",
    marginTop: tokens.spacingVerticalS,
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
              color={tokens.colorNeutralForeground1}
              fontSize={tokens.fontSizeBase400}
              strokeWidth={2}
            />
          }
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
                  className={styles.closeButton}
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
              className={styles.saveButton}
              form="create-workbook"
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
