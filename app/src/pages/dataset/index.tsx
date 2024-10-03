import {
  Card,
  makeStyles,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import {
  DatasetList,
  type DatasetListProps,
} from "../../components/dataset-management";
import { useTabs } from "../../hooks/use-tabs";

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
});

type TabValue = "seed" | "normalization" | "akiya";

export function Dataset(): JSX.Element {
  const styles = useStyles();
  const initialTabValue: TabValue = "seed";
  const { onTabSelect, selectedValue } = useTabs<TabValue>(initialTabValue);
  const [selectedDatasets, setSelectedDatasets] = useState<
    DatasetListProps["dataSets"] | undefined
  >(undefined);

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
          {/* <Tab value="tab3">AIデータソース</Tab> */}
          <Tab value="akiya">空き家判定結果データ</Tab>
        </TabList>
      </div>
      <Card className={styles.content}>
        {selectedDatasets ? <DatasetList dataSets={selectedDatasets} /> : null}
      </Card>
    </div>
  );
}

const _dummyDataSetSeeds: DatasetListProps["dataSets"] = [
  { name: "シードデータ", date: "2024/4/21" },
  { name: "水道メーター1.shp", date: "2024/4/21" },
  { name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { name: "水道メーター2.shp", date: "2024/4/21" },
];

const _dummyDataSetNormalizations: DatasetListProps["dataSets"] = [
  { name: "正規化済みデータ", date: "2024/4/21" },
  { name: "水道メーター1.shp", date: "2024/4/21" },
  { name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { name: "水道メーター2.shp", date: "2024/4/21" },
];

const _dummyDataSetResults: DatasetListProps["dataSets"] = [
  { name: "空き家判定結果データ", date: "2024/4/21" },
  { name: "水道メーター1.shp", date: "2024/4/21" },
  { name: "前処理住民台帳1.csv", date: "2024/4/21" },
  { name: "前処理住民台帳2.csv", date: "2024/4/21" },
  { name: "前処理住民台帳3.csv", date: "2024/4/21" },
  { name: "水道メーター2.shp", date: "2024/4/21" },
];
