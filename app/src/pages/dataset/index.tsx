import { useEffect, useState } from "react";
import {
  Card,
  makeStyles,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { ArrowDownloadRegular } from "@fluentui/react-icons";
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

  const handleUpload = (): void => {
    // eslint-disable-next-line no-console -- for debug
    console.log("Upload button clicked");
  };

  const handleDownload = (): void => {
    // eslint-disable-next-line no-console -- for debug
    console.log("Download button clicked");
  };

  // TODO: DBのデータを削除するように修正する
  const handleDeleteSelectedItems = (): void => {
    setSelectedDatasets((prev) =>
      prev.filter((dataset) => !selectedItemIds.includes(dataset.id)),
    );
    setSelectedItemIds([]);
  };

  // TODO: DBのデータを更新するように修正する
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

  // TODO: DBのデータを削除するように修正する
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
          <Button appearance="outline" onClick={handleUpload}>
            + 新規アップロード
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
            dataSets={selectedDatasets}
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
