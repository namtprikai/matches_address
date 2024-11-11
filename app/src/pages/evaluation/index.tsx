import {
  Card,
  makeStyles,
  Subtitle2,
  tokens,
  typographyStyles,
  Dialog,
  DialogTrigger,
} from "@fluentui/react-components";
import {
  DeleteRegular,
  AddRegular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { DialogSurface } from "../../components/ui/dialog-surface";
import { DialogBody } from "../../components/ui/dialog-body";
import { DialogTitle } from "../../components/ui/dialog-title";
import { DialogContent } from "../../components/ui/dialog-content";
import { DialogActions } from "../../components/ui/dialog-actions";
import { useDialogState } from "../../hooks/use-dialog-state";
import { Button } from "../../components/ui/button";
import { DialogImportModelDataset } from "../../components/dialog-import-model-dataset";
import { type SelectModelFile } from "../../schema";

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: tokens.spacingVerticalXXL,
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
    height: "34px",
  },
  contents: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalXL,
    height: "68px",
  },
  restartButton: {
    backgroundColor: "#6264A7",
    color: "#fff",
    borderRadius: "100px",
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalL}`,
    height: "40px",
  },
  file: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  deleteIconWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      cursor: "pointer",
    },
  },
  button: {
    width: "130px",
  },
  text: typographyStyles.caption1Strong,
  dialogSurface: {
    width: "449px",
  },
  fileName: {
    color: "#6264A7",
    textDecoration: "underline",
  },
});

export const JobEvaluation = (): JSX.Element => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, setIsOpen } = useDialogState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModelFile, setSelectedModelFile] =
    useState<SelectModelFile | null>(null);
  const importModelDatasetDialogState = useDialogState();
  const navigate = useNavigate();

  const handleUploadButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = (): void => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // モデルファイルの削除
  const handleRemoveModelFile = (): void => {
    setSelectedModelFile(null);
  };

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>空き家判定</h2>

      <div className={styles.contents}>
        <Card>
          <Subtitle2>① ファイルをインポート</Subtitle2>
          <div className={styles.file}>
            {selectedModelFile ? (
              <>
                <span className={styles.fileName}>
                  {selectedModelFile.file_name}
                </span>
                <span
                  className={styles.deleteIconWrapper}
                  onClick={handleRemoveModelFile}
                >
                  <DeleteRegular fontSize={16} />
                </span>
              </>
            ) : (
              <Button
                appearance="primary"
                onClick={() => importModelDatasetDialogState.setIsOpen(true)}
              >
                選択
              </Button>
            )}
          </div>
        </Card>

        <DialogImportModelDataset
          dialogState={importModelDatasetDialogState}
          onSelected={(data) => {
            setSelectedModelFile(data);
          }}
        />

        <Card>
          <Subtitle2>② 分析対象のデータを選択</Subtitle2>
          <div className={styles.file}>
            {selectedFile ? (
              <>
                <span className={styles.fileName}>{selectedFile.name}</span>
                <span
                  className={styles.deleteIconWrapper}
                  onClick={handleRemoveFile}
                >
                  <DeleteRegular fontSize={16} />
                </span>
              </>
            ) : (
              <div>ファイルが選択されていません</div>
            )}
          </div>
          <input
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            type="file"
          />
          <Button
            appearance="outline"
            className={styles.button}
            icon={<AddRegular />}
            onClick={handleUploadButtonClick}
          >
            <span className={styles.text}>データを追加</span>
          </Button>
        </Card>
      </div>

      <div className={styles.footer}>
        <Dialog
          onOpenChange={(event, data) => setIsOpen(data.open)}
          open={isOpen}
        >
          <DialogTrigger disableButtonEnhancement>
            <Button
              className={styles.restartButton}
              disabled={!selectedFile || !selectedModelFile}
              onClick={() => setIsOpen(true)}
            >
              分析開始
            </Button>
          </DialogTrigger>
          <DialogSurface className={styles.dialogSurface}>
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
                      onClick={() => setIsOpen(false)}
                    />
                  </DialogTrigger>
                }
              >
                分析を開始しました
              </DialogTitle>
              <DialogContent>
                <div>
                  処理が完了するまで一定の時間がかかります
                  ステータスは「非同期処理一覧画面」で確認できます。
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="primary"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/job");
                  }}
                  size="medium"
                >
                  非同期処理一覧画面へ
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </div>
  );
};
