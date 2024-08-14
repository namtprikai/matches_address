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
  dialogTitle: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: "24px",
    height: "24px",
  },
  dialogBody: {
    gap: tokens.spacingVerticalL,
  },
  dialogSurface: {
    boxShadow: tokens.shadow28,
    borderRadius: tokens.borderRadiusXLarge,
    maxWidth: "450px",
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
  form: {
    "& span:has(> input)": {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: tokens.borderRadiusXLarge,
      "&:active, &:hover, &:focus, &:focus-within": {
        border: `1px solid ${tokens.colorNeutralStroke1Pressed}`,
      },
    },
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
      <DialogSurface className={styles.dialogSurface}>
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
            className={styles.dialogTitle}
          >
            ワークブック名
          </DialogTitle>
          <DialogContent>
            <form
              className={styles.form}
              id="create-workbook"
              onSubmit={handleSubmit}
            >
              <Input className={styles.input} name="title" />
            </form>
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
