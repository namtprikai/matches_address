import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Card,
  makeStyles,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { ArrowDownloadRegular, AddRegular } from "@fluentui/react-icons";
import { useTabs } from "../../hooks/use-tabs";
import { type Dataset } from "../../components/dataset/dataset-list";
import { DeleteRowsDialog } from "../../components/dataset/delete-rows-dialog";
import { Button } from "../../components/ui/button";
import { RawDataSetTable } from "../../components/dataset/raw-dataset-table";
import { NormalizedDataSetTable } from "../../components/dataset/normalized-dataset-table";
import { ResultDataSetTable } from "../../components/dataset/result-dataset-table";
import { type InsertRawDataSet } from "../../schema";
import { useFetchRawDatasets } from "../../hooks/use-fetch-raw-datasets";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalL,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalL,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  content: {
    display: "block",
    minHeight: "300px",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& > div": {
      display: "flex",
      alignItems: "center",
      gap: tokens.spacingHorizontalM,
    },
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  iconButton: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    "&:hover, &:active, &:focus, &:focus-within": {
      border: `1px solid ${tokens.colorNeutralStroke1Selected}`,
    },
  },
  datasetList: {
    marginTop: tokens.spacingVerticalL,
  },
});

const TAB_VALUES = ["seed", "normalization", "result"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export function Dataset(): JSX.Element {
  const styles = useStyles();
  const initialTabValue: TabValue = "seed";
  const { onTabSelect, selectedValue } = useTabs<TabValue>(initialTabValue);
  const [selectedItemIds, setSelectedItemIds] = useState<Dataset["id"][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useFetchRawDatasets();

  const handleUploadButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    // TODO: バックエンド処理
  };

  // TODO: バックエンド処理
  const handleDownload = async (): Promise<void> => {
    try {
      const response = await fetch("/dummy-data.csv");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dummy-data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("ダウンロードに失敗しました。");
    }
  };

  const handleDeleteSelectedItems = (): void => {
    // TODO: バックエンド処理
    setSelectedItemIds([]);
  };

  const handleEditItem = (
    id: Dataset["id"],
    newName: Dataset["name"],
  ): void => {
    // TODO: バックエンド処理
  };

  const handleDeleteItem = (id: Dataset["id"]): void => {
    // TODO: バックエンド処理
  };

  async function _handleAddDummyDataSets(): Promise<void> {
    void Promise.all(
      _dummyRawDataSets.map((seed) =>
        window.ipcRenderer.invoke("insertRawDatasets", seed),
      ),
    ).then(() => mutate());
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.heading}>データセット管理</h2>
        <TabList
          defaultSelectedValue={initialTabValue}
          onTabSelect={onTabSelect}
        >
          {TAB_VALUES.map((value) => (
            <Tab key={value} value={value}>
              {
                {
                  seed: "シードデータ",
                  normalization: "正規化済データ",
                  result: "空き家判定結果データ",
                }[value]
              }
            </Tab>
          ))}
        </TabList>
        <Button onClick={_handleAddDummyDataSets}>
          ダミーデータを追加する
        </Button>
      </div>
      <Card className={styles.content}>
        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
            type="file"
          />
          <Button
            appearance="outline"
            className={styles.uploadButton}
            onClick={handleUploadButtonClick}
          >
            <AddRegular />
            新規アップロード
          </Button>
          <div>
            <span>{selectedItemIds.length}件選択中</span>
            <Button
              appearance="outline"
              className={styles.iconButton}
              disabled={selectedItemIds.length === 0}
              icon={<ArrowDownloadRegular />}
              onClick={handleDownload}
            />
            <DeleteRowsDialog
              disabled={selectedItemIds.length === 0}
              onDelete={handleDeleteSelectedItems}
            />
          </div>
        </div>
        <div className={styles.datasetList}>
          {
            {
              seed: <RawDataSetTable onSelectionChange={setSelectedItemIds} />,
              normalization: (
                <NormalizedDataSetTable
                  onDelete={handleDeleteItem}
                  onSelectionChange={setSelectedItemIds}
                  onSubmit={handleEditItem}
                />
              ),
              result: (
                <ResultDataSetTable
                  onDelete={handleDeleteItem}
                  onSelectionChange={setSelectedItemIds}
                  onSubmit={handleEditItem}
                />
              ),
            }[selectedValue]
          }
        </div>
      </Card>
    </div>
  );
}

const _dummyRawDataSets: InsertRawDataSet[] = [
  {
    file_name: "シードデータ",
    file_path: "dummy-data.csv",
  },
  {
    file_name: "水道メーター1.shp",
    file_path: "dummy-data.csv",
  },
  {
    file_name: "前処理住民台帳1.csv",
    file_path: "dummy-data.csv",
  },
  {
    file_name: "前処理住民台帳2.csv",
    file_path: "dummy-data.csv",
  },
  {
    file_name: "前処理住民台帳3.csv",
    file_path: "dummy-data.csv",
  },
  {
    file_name: "水道メーター2.shp",
    file_path: "dummy-data.csv",
  },
];
