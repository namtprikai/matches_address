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
import {
  type Dataset,
  DatasetList,
} from "../../components/dataset/dataset-list";
import { DeleteSelectedItemsDialog } from "../../components/dataset/delete-selected-items-dialog";
import { Button } from "../../components/ui/button";

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

type TabValue = "seed" | "normalization" | "akiya";

export function Dataset(): JSX.Element {
  const styles = useStyles();
  const initialTabValue: TabValue = "seed";
  const { onTabSelect, selectedValue } = useTabs<TabValue>(initialTabValue);
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Dataset["id"][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    switch (selectedValue) {
      case "seed":
        setSelectedDatasets(_dummyDataSetSeeds);
        break;
      case "normalization":
        setSelectedDatasets(_dummyDataSetNormalizations);
        break;
      case "akiya":
        setSelectedDatasets(_dummyDataSetResults);
        break;
      default: {
        const exhaustiveCheck: never = selectedValue;
        throw new Error(`Unhandled tab value: ${exhaustiveCheck}`);
      }
    }
  }, [selectedValue]);

  const handleUploadButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  // TODO: バックエンド処理
  const handleUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDatasets((prev) => [
        { id: prev.length + 1, name: file.name, date: "2024/4/21" },
        ...prev,
      ]);
    }
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

  // TODO: バックエンド処理
  const handleDeleteSelectedItems = (): void => {
    setSelectedDatasets((prev) =>
      prev.filter((dataset) => !selectedItemIds.includes(dataset.id)),
    );
    setSelectedItemIds([]);
  };

  // TODO: バックエンド処理
  const handleEditItem = (
    id: Dataset["id"],
    newName: Dataset["name"],
  ): void => {
    setSelectedDatasets((prev) =>
      prev.map((dataset) =>
        dataset.id === id ? { ...dataset, name: newName } : dataset,
      ),
    );
  };

  // TODO: バックエンド処理
  const handleDeleteItem = (id: Dataset["id"]): void => {
    setSelectedDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.heading}>データセット管理</h2>
        <TabList
          defaultSelectedValue={initialTabValue}
          onTabSelect={onTabSelect}
        >
          <Tab value="seed">シードデータ</Tab>
          <Tab value="normalization">正規化済データ</Tab>
          <Tab value="akiya">空き家判定結果データ</Tab>
        </TabList>
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
              icon={<ArrowDownloadRegular />}
              onClick={handleDownload}
            />
            <DeleteSelectedItemsDialog
              disabled={selectedItemIds.length === 0}
              onDelete={handleDeleteSelectedItems}
            />
          </div>
        </div>
        <div className={styles.datasetList}>
          <DatasetList
            datasets={selectedDatasets}
            onDelete={handleDeleteItem}
            onSelectionChange={setSelectedItemIds}
            onSubmit={handleEditItem}
          />
        </div>
      </Card>
    </div>
  );
}

const _dummyDataSetSeeds: Dataset[] = [
  { id: 1, name: "シードデータ", date: "2024/4/21" },
  { id: 2, name: "水道メーター1.shp", date: "2024/4/21" },
  { id: 3, name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { id: 4, name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { id: 5, name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { id: 6, name: "水道メーター2.shp", date: "2024/4/21" },
];

const _dummyDataSetNormalizations: Dataset[] = [
  { id: 1, name: "正規化済みデータ", date: "2024/4/21" },
  { id: 2, name: "水道メーター1.shp", date: "2024/4/21" },
  { id: 3, name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { id: 4, name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { id: 5, name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { id: 6, name: "水道メーター2.shp", date: "2024/4/21" },
];

const _dummyDataSetResults: Dataset[] = [
  { id: 1, name: "空き家判定結果データ", date: "2024/4/21" },
  { id: 2, name: "水道メーター1.shp", date: "2024/4/21" },
  { id: 3, name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { id: 4, name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { id: 5, name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { id: 6, name: "水道メーター2.shp", date: "2024/4/21" },
];
