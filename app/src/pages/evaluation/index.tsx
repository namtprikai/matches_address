import {
  Card,
  makeStyles,
  Subtitle2,
  tokens,
  typographyStyles,
  Dialog,
  DialogTrigger,
} from "@fluentui/react-components";
import { DeleteRegular, Dismiss24Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DialogSurface } from "../../components/ui/dialog-surface";
import { DialogBody } from "../../components/ui/dialog-body";
import { DialogTitle } from "../../components/ui/dialog-title";
import { DialogContent } from "../../components/ui/dialog-content";
import { DialogActions } from "../../components/ui/dialog-actions";
import { useDialogState } from "../../hooks/use-dialog-state";
import { Button } from "../../components/ui/button";
import { DialogImportModelDataset } from "../../components/dialog-import-model-dataset";
import { DialogImportAnalysisDataset } from "../../components/dialog-import-analysis-dataset";
import { DialogModelAdvanced } from "../../components/dialog-model-advanced";
import { useFormModelCreate } from "../../hooks/use-form-model-create";
import { type SelectModelFile } from "../../schema";
import { Dropdown } from "../../components/ui/dropdown";

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
    flexWrap: "wrap",
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
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  dropdownWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  dropdown: {
    width: "196px",
    height: "36px",
  },
});

export const JobEvaluation = (): JSX.Element => {
  const styles = useStyles();
  const { isOpen, setIsOpen } = useDialogState(false);
  const [selectedFile, setSelectedFile] = useState<SelectModelFile | null>(
    null,
  );
  const [selectedModelFile, setSelectedModelFile] =
    useState<SelectModelFile | null>(null);
  const importModelDatasetDialogState = useDialogState();
  const importAnalysisDatasetDialogState = useDialogState();
  const modelAdvancedDialogState = useDialogState();
  const navigate = useNavigate();
  const form = useFormModelCreate();

  // 分析対象のデータの削除
  const handleRemoveFile = (): void => {
    setSelectedFile(null);
  };

  // モデルファイルの削除
  const handleRemoveModelFile = (): void => {
    setSelectedModelFile(null);
  };

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>空き家判定</h2>

      <div className={styles.contents}>
        {/* モデルファイルの選択 */}
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

        {/* 分析対象のデータの選択 */}
        <Card>
          <Subtitle2>② 分析対象のデータを選択</Subtitle2>
          <div className={styles.file}>
            {selectedFile ? (
              <div key={selectedFile.id} className={styles.fileItem}>
                <span className={styles.fileName}>
                  {selectedFile.file_name}
                </span>
                <span
                  className={styles.deleteIconWrapper}
                  onClick={handleRemoveFile}
                >
                  <DeleteRegular fontSize={16} />
                </span>
              </div>
            ) : (
              <Button
                appearance="primary"
                onClick={() => importAnalysisDatasetDialogState.setIsOpen(true)}
              >
                選択
              </Button>
            )}
          </div>
        </Card>

        <DialogImportAnalysisDataset
          dialogState={importAnalysisDatasetDialogState}
          onSelected={(data) => {
            setSelectedFile(data);
          }}
        />

        <Card>
          <Subtitle2>③ 地域集計用データをアップロード</Subtitle2>
          <div className={styles.file}>
            {selectedFile ? (
              <div key={selectedFile.id} className={styles.fileItem}>
                <span className={styles.fileName}>
                  {selectedFile.file_name}
                </span>
                <span
                  className={styles.deleteIconWrapper}
                  onClick={handleRemoveFile}
                >
                  <DeleteRegular fontSize={16} />
                </span>
              </div>
            ) : (
              <Button
                appearance="primary"
                onClick={() => importAnalysisDatasetDialogState.setIsOpen(true)}
              >
                アップロード
              </Button>
            )}
          </div>
          <div className={styles.dropdownWrapper}>
            <label htmlFor="area-id-dropdown">地域IDカラム</label>
            <Dropdown
              className={styles.dropdown}
              id="area-id-dropdown"
              placeholder="選択"
            />
            <label htmlFor="area-name-dropdown">地域名称カラム</label>
            <Dropdown
              className={styles.dropdown}
              id="area-name-dropdown"
              placeholder="選択"
            />
          </div>
        </Card>

        <Card>
          <Subtitle2>④ 高度な設定</Subtitle2>
          <div className={styles.file}>
            <Button
              appearance="transparent"
              onClick={() => modelAdvancedDialogState.setIsOpen(true)}
            >
              高度な設定を変更
            </Button>
          </div>
        </Card>

        <DialogModelAdvanced
          dialogState={modelAdvancedDialogState}
          formState={form}
        />
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
