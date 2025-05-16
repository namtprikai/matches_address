import {
  Body1Strong,
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { DialogSurface } from "../../ui/dialog-surface";
import { DialogBody } from "../../ui/dialog-body";
import { DialogTitle } from "../../ui/dialog-title";
import { Button } from "../../ui/button";
import { DialogContent } from "../../ui/dialog-content";
import { FileUploader } from "../../ui/file-uploader/file-uploader";
import { DialogActions } from "../../ui/dialog-actions";
import { type UseDialogCreateResultDatasetReturn } from "./type";

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
  uploadWrap: {
    height: "325px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalXXS,
  },
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXXXL}`,
    gap: tokens.spacingVerticalL,
  },
  disabledButton: {
    backgroundColor: "#EFF0F0",
    color: "#89949F",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#EFF0F0",
    },
  },
});

type Props = UseDialogCreateResultDatasetReturn;

export const DialogCreateResultDataset = ({
  dialogState: { isOpen, setIsOpen },
  buildingFileState: { handleFileChange: handleBuildingFileChange },
  areaFileState: { handleFileChange: handleAreaFileChange },
  disabled,
  isLoading,
  handleClick,
}: Props): JSX.Element => {
  const styles = useStyles();

  return (
    <Dialog onOpenChange={(_, { open }) => setIsOpen(open)} open={isOpen}>
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
            空き家推定結果をアップロード
          </DialogTitle>
          <DialogContent className={styles.uploadWrap}>
            <div className={styles.uploadContent}>
              <Body1Strong>建物単位データを追加</Body1Strong>
              <FileUploader
                isLoading={isLoading}
                onUpload={async (file) => {
                  await handleBuildingFileChange(file);
                }}
              />
            </div>
            <div className={styles.uploadContent}>
              <Body1Strong>地域単位データを追加</Body1Strong>
              <FileUploader
                isLoading={isLoading}
                onUpload={async (file) => {
                  await handleAreaFileChange(file);
                }}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              className={disabled ? styles.disabledButton : ""}
              disabled={disabled}
              onClick={handleClick}
            >
              アップロードを開始
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
