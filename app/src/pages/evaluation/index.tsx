import { useEffect, useState } from "react";
import {
  Card,
  makeStyles,
  Subtitle2,
  tokens,
  typographyStyles,
  Dialog,
  Option,
  DialogTrigger,
} from "@fluentui/react-components";
import { DeleteRegular, Dismiss24Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { DialogSurface } from "../../components/ui/dialog-surface";
import { DialogBody } from "../../components/ui/dialog-body";
import { DialogTitle } from "../../components/ui/dialog-title";
import { DialogContent } from "../../components/ui/dialog-content";
import { DialogActions } from "../../components/ui/dialog-actions";
import { DialogSetting } from "../../components/dialog-setting";
import { useDialogState } from "../../hooks/use-dialog-state";
import { Button } from "../../components/ui/button";
import { DialogSelectDataset } from "../../components/dialog-select-dataset";
import {
  type SelectModelFile,
  type SelectNormalizedDataSet,
  type SelectRawDataSet,
} from "../../schema";
import { Dropdown } from "../../components/ui/dropdown";
import { useFetchModelFiles } from "../../hooks/use-fetch-model-files";
import { useFetchNormalizedDatasets } from "../../hooks/use-fetch-normalized-datasets";
import { useFetchRawDatasets } from "../../hooks/use-fetch-raw-datasets";
import { useFetchDatasetColumns } from "../../hooks/use-fetch-dataset-columns";

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

type AdvancedSettingsType = {
  similarityThreshold: number;
};

const initialAdvancedSettings: AdvancedSettingsType = {
  similarityThreshold: 0, // デフォルト値
};

type FormValues = {
  selectedModelFile: SelectModelFile | null;
  selectedFile: SelectNormalizedDataSet | null;
  selectedAreaFile: SelectRawDataSet | null;
  selectedAreaIdColumn: string;
  selectedAreaNameColumn: string;
  advancedSettings: AdvancedSettingsType;
};

export const JobEvaluation = (): JSX.Element => {
  const styles = useStyles();
  const navigate = useNavigate();

  // フォームの初期化
  const { handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      selectedModelFile: null,
      selectedFile: null,
      selectedAreaFile: null,
      selectedAreaIdColumn: "",
      selectedAreaNameColumn: "",
      advancedSettings: initialAdvancedSettings,
    },
  });

  // ダイアログの状態管理
  const importModelDatasetDialogState = useDialogState();
  const importAnalysisDatasetDialogState = useDialogState();
  const importAreaDatasetDialogState = useDialogState();
  const analysisStartDialogState = useDialogState(false);

  // カラム情報と選択されたカラムの状態管理
  const [areaColumns, setAreaColumns] = useState<string[]>([]);

  // 選択された値を取得
  const selectedModelFile = watch("selectedModelFile");
  const selectedFile = watch("selectedFile");
  const selectedAreaFile = watch("selectedAreaFile");
  const selectedAreaIdColumn = watch("selectedAreaIdColumn");
  const selectedAreaNameColumn = watch("selectedAreaNameColumn");
  const advancedSettings = watch("advancedSettings");

  // カラム情報を取得するフック
  const { data: areaFileColumns } = useFetchDatasetColumns({
    filename: selectedAreaFile?.file_path,
  });

  useEffect(() => {
    if (areaFileColumns) {
      setAreaColumns(areaFileColumns);
    } else {
      setAreaColumns([]);
    }
  }, [areaFileColumns]);

  // フォーム送信時の処理
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // ここで API リクエストを行う
  };

  // 分析対象のデータの削除
  const handleRemoveFile = (): void => {
    setValue("selectedFile", null);
  };

  // モデルファイルの削除
  const handleRemoveModelFile = (): void => {
    setValue("selectedModelFile", null);
  };

  // 地域集計用データの削除
  const handleRemoveAreaFile = (): void => {
    setValue("selectedAreaFile", null);
    setAreaColumns([]);
    setValue("selectedAreaIdColumn", "");
    setValue("selectedAreaNameColumn", "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.root}>
        <h2 className={styles.heading}>空き家判定</h2>

        <div className={styles.contents}>
          {/* モデルファイルの選択 */}
          <Card>
            <Subtitle2>① 利用するモデルを選択</Subtitle2>
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

          {/* ダイアログの定義 */}
          <DialogSelectDataset<SelectModelFile>
            dialogState={importModelDatasetDialogState}
            emptyMessage="現在表示できるモデルはありません"
            isModel
            onSelected={(data) => {
              setValue("selectedModelFile", data);
            }}
            placeholder="モデル名"
            title="利用するモデルを選択"
            useFetchDatasets={useFetchModelFiles}
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
                  onClick={() =>
                    importAnalysisDatasetDialogState.setIsOpen(true)
                  }
                >
                  選択
                </Button>
              )}
            </div>
          </Card>

          {/* ダイアログの定義 */}
          <DialogSelectDataset<SelectNormalizedDataSet>
            dialogState={importAnalysisDatasetDialogState}
            emptyMessage="現在表示できるデータセットはありません"
            onSelected={(data) => {
              setValue("selectedFile", data);
            }}
            placeholder="データ名"
            title="分析対象のデータを選択"
            useFetchDatasets={useFetchNormalizedDatasets}
          />

          {/* 地域集計用データの選択 */}
          <Card>
            <Subtitle2>③ 地域集計用データをアップロード</Subtitle2>
            <div className={styles.file}>
              {selectedAreaFile ? (
                <div key={selectedAreaFile.id} className={styles.fileItem}>
                  <span className={styles.fileName}>
                    {selectedAreaFile.file_name}
                  </span>
                  <span
                    className={styles.deleteIconWrapper}
                    onClick={handleRemoveAreaFile}
                  >
                    <DeleteRegular fontSize={16} />
                  </span>
                </div>
              ) : (
                <Button
                  appearance="primary"
                  onClick={() => importAreaDatasetDialogState.setIsOpen(true)}
                >
                  選択
                </Button>
              )}
            </div>

            {/* ドロップダウンの表示 */}
            {selectedAreaFile && (
              <div className={styles.dropdownWrapper}>
                <label htmlFor="area-id-dropdown">地域IDカラム</label>
                <Dropdown
                  className={styles.dropdown}
                  id="area-id-dropdown"
                  onOptionSelect={(event, data) =>
                    setValue("selectedAreaIdColumn", data.optionValue ?? "")
                  }
                  placeholder="選択"
                  value={selectedAreaIdColumn}
                >
                  {areaColumns.map((column) => (
                    <Option key={column} text={column} value={column}>
                      {column}
                    </Option>
                  ))}
                </Dropdown>
                <label htmlFor="area-name-dropdown">地域名称カラム</label>
                <Dropdown
                  className={styles.dropdown}
                  id="area-name-dropdown"
                  onOptionSelect={(event, data) =>
                    setValue("selectedAreaNameColumn", data.optionValue ?? "")
                  }
                  placeholder="選択"
                  value={selectedAreaNameColumn}
                >
                  {areaColumns.map((column) => (
                    <Option key={column} text={column} value={column}>
                      {column}
                    </Option>
                  ))}
                </Dropdown>
              </div>
            )}
          </Card>

          {/* ダイアログの定義 */}
          <DialogSelectDataset<SelectRawDataSet>
            dialogState={importAreaDatasetDialogState}
            emptyMessage="現在表示できるデータセットはありません"
            onSelected={(data) => {
              setValue("selectedAreaFile", data);
            }}
            placeholder="データ名"
            title="地域集計用データを選択"
            useFetchDatasets={useFetchRawDatasets}
          />

          {/* 高度な設定 */}
          <Card>
            <Subtitle2>④ 高度な設定</Subtitle2>
            <div className={styles.file}>
              <DialogSetting
                onChange={(newValue) => setValue("advancedSettings", newValue)}
                value={advancedSettings}
              />
            </div>
          </Card>
        </div>

        {/* フッター */}
        <div className={styles.footer}>
          <Button
            className={styles.restartButton}
            disabled={
              !selectedFile ||
              !selectedModelFile ||
              !selectedAreaFile ||
              !selectedAreaIdColumn ||
              !selectedAreaNameColumn
            }
            type="submit"
          >
            分析開始
          </Button>
        </div>

        {/* 分析開始後のダイアログ */}
        <Dialog
          onOpenChange={(event, data) =>
            analysisStartDialogState.setIsOpen(data.open)
          }
          open={analysisStartDialogState.isOpen}
        >
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
                      onClick={() => analysisStartDialogState.setIsOpen(false)}
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
                    analysisStartDialogState.setIsOpen(false);
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
    </form>
  );
};
