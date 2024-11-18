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
import { useState, useEffect } from "react";
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

export const JobEvaluation = (): JSX.Element => {
  const navigate = useNavigate();
  const styles = useStyles();
  const { isOpen, setIsOpen } = useDialogState(false);

  // 選択されたファイルの状態管理
  const [selectedFile, setSelectedFile] =
    useState<SelectNormalizedDataSet | null>(null);
  const [selectedModelFile, setSelectedModelFile] =
    useState<SelectModelFile | null>(null);
  const [selectedAreaFile, setSelectedAreaFile] =
    useState<SelectRawDataSet | null>(null);

  // ダイアログの状態管理
  const importModelDatasetDialogState = useDialogState();
  const importAnalysisDatasetDialogState = useDialogState();
  const importAreaDatasetDialogState = useDialogState();

  // 高度な設定の状態管理
  const [advancedSettings, setAdvancedSettings] =
    useState<AdvancedSettingsType>(initialAdvancedSettings);

  // カラム情報と選択されたカラムの状態管理
  const [areaColumns, setAreaColumns] = useState<string[]>([]);
  const [selectedAreaIdColumn, setSelectedAreaIdColumn] = useState<string>("");
  const [selectedAreaNameColumn, setSelectedAreaNameColumn] =
    useState<string>("");

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

  // 分析対象のデータの削除
  const handleRemoveFile = (): void => {
    setSelectedFile(null);
  };

  // モデルファイルの削除
  const handleRemoveModelFile = (): void => {
    setSelectedModelFile(null);
  };

  // 地域集計用データの削除
  const handleRemoveAreaFile = (): void => {
    setSelectedAreaFile(null);
    setAreaColumns([]);
    setSelectedAreaIdColumn("");
    setSelectedAreaNameColumn("");
  };

  return (
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
            setSelectedModelFile(data);
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
                onClick={() => importAnalysisDatasetDialogState.setIsOpen(true)}
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
            setSelectedFile(data);
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
          <div className={styles.dropdownWrapper}>
            <label htmlFor="area-id-dropdown">地域IDカラム</label>
            <Dropdown
              className={styles.dropdown}
              id="area-id-dropdown"
              onOptionSelect={(event, data) =>
                setSelectedAreaIdColumn(data.optionValue ?? "")
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
                setSelectedAreaIdColumn(data.optionValue ?? "")
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
        </Card>

        {/* ダイアログの定義 */}
        <DialogSelectDataset<SelectRawDataSet>
          dialogState={importAreaDatasetDialogState}
          emptyMessage="現在表示できるデータセットはありません"
          onSelected={(data) => {
            setSelectedAreaFile(data);
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
              onChange={(newValue) => setAdvancedSettings(newValue)}
              value={advancedSettings}
            />
          </div>
        </Card>
      </div>

      {/* フッター */}
      <div className={styles.footer}>
        <Dialog
          onOpenChange={(event, data) => setIsOpen(data.open)}
          open={isOpen}
        >
          <DialogTrigger disableButtonEnhancement>
            <Button
              className={styles.restartButton}
              disabled={
                !selectedFile || !selectedModelFile || !selectedAreaFile
              }
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
