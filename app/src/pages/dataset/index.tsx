import { type ChangeEvent, useRef, useState } from "react";
import {
  Card,
  makeStyles,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import { useTabs } from "../../hooks/use-tabs";
import { DeleteRowsDialog } from "../../components/dataset/delete-rows-dialog";
import { Button } from "../../components/ui/button";
import { RawDataSetTable } from "../../components/dataset/raw-dataset-table";
import { NormalizedDataSetTable } from "../../components/dataset/normalized-dataset-table";
import { ResultDataSetTable } from "../../components/dataset/result-dataset-table";
import {
  type InsertNormalizedDataSet,
  type InsertRawDataSet,
} from "../../schema";
import { useFetchRawDatasets } from "../../hooks/use-fetch-raw-datasets";
import { useFetchNormalizedDatasets } from "../../hooks/use-fetch-normalized-datasets";
import { saveDataSetFile } from "../../utils/save-data-set-file";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";

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

const TAB_VALUES = ["raw", "normalization", "result"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export function Dataset(): JSX.Element {
  const styles = useStyles();
  const initialTabValue: TabValue = "raw";
  const { onTabSelect, selectedValue } = useTabs<TabValue>(initialTabValue);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: mutateRaw } = useFetchRawDatasets();
  const { mutate: mutateNormalized } = useFetchNormalizedDatasets();
  const { mutate: mutateResult } = useFetchDataSetResults();

  const handleUploadButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    void saveDataSetFile(file, selectedValue);
    void mutateRaw();
    e.target.value = ""; // ファイル選択をリセットする
  };

  const handleDeleteSelectedItems = async (): Promise<void> => {
    switch (selectedValue) {
      case "raw": {
        await Promise.all(
          selectedItemIds.map((id) =>
            window.ipcRenderer.invoke("deleteRawDataset", {
              id,
            }),
          ),
        )
          .then(() => {
            void mutateRaw(
              (prev) =>
                prev?.filter((item) => !selectedItemIds.includes(item.id)),
              false,
            );
            setSelectedItemIds([]);
          })
          .catch(console.error);
        break;
      }
      case "normalization": {
        await Promise.all(
          selectedItemIds.map((id) =>
            window.ipcRenderer.invoke("deleteNormalizedDataset", {
              id,
            }),
          ),
        )
          .then(() => {
            void mutateNormalized(
              (prev) =>
                prev?.filter((item) => !selectedItemIds.includes(item.id)),
              false,
            );
            setSelectedItemIds([]);
          })
          .catch(console.error);
        break;
      }
      case "result": {
        await Promise.all(
          selectedItemIds.map((id) =>
            window.ipcRenderer.invoke("deleteDataSetResult", {
              id,
            }),
          ),
        )
          .then(() => {
            void mutateResult(
              (prev) =>
                prev?.filter((item) => !selectedItemIds.includes(item.id)),
              false,
            );
            setSelectedItemIds([]);
          })
          .catch(console.error);
        break;
      }
      default: {
        const exhaustiveCheck: never = selectedValue;
        throw new Error(`Unhandled type: ${exhaustiveCheck}`);
      }
    }
  };

  async function _handleAddDummyDataSets(): Promise<void> {
    for (const seed of _dummyRawDataSets) {
      await window.ipcRenderer.invoke("insertRawDatasets", seed);
    }
    for (const normalized of _dummyNormalizedDataSets) {
      await window.ipcRenderer.invoke("insertNormalizedDatasets", normalized);
    }
    void mutateRaw();
    void mutateNormalized();
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.heading}>データセット管理</h2>
        <TabList
          defaultSelectedValue={initialTabValue}
          onTabSelect={(e, data) => {
            onTabSelect(e, data);
            setSelectedItemIds([]);
          }}
        >
          {TAB_VALUES.map((value) => (
            <Tab key={value} value={value}>
              {
                {
                  raw: "シードデータ",
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
          <div>
            {selectedValue === "raw" || selectedValue === "normalization" ? (
              <>
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
              </>
            ) : null}
          </div>
          <div>
            <span>{selectedItemIds.length}件選択中</span>
            <DeleteRowsDialog
              disabled={selectedItemIds.length === 0}
              onDelete={handleDeleteSelectedItems}
            />
          </div>
        </div>
        <div className={styles.datasetList}>
          {
            {
              raw: <RawDataSetTable onSelectionChange={setSelectedItemIds} />,
              normalization: (
                <NormalizedDataSetTable
                  onSelectionChange={setSelectedItemIds}
                />
              ),
              result: (
                <ResultDataSetTable onSelectionChange={setSelectedItemIds} />
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

const _dummyNormalizedDataSets: InsertNormalizedDataSet[] = [
  {
    file_name: "正規化済みデータ",
    file_path: "dummy-data.csv",
    job_results_id: 1,
  },
  {
    file_name: "水道メーター1.shp",
    file_path: "dummy-data.csv",
    job_results_id: 2,
  },
  {
    file_name: "前処理住民台帳1.csv",
    file_path: "dummy-data.csv",
    job_results_id: 3,
  },
  {
    file_name: "前処理住民台帳2.csv",
    file_path: "dummy-data.csv",
    job_results_id: 4,
  },
  {
    file_name: "前処理住民台帳3.csv",
    file_path: "dummy-data.csv",
    job_results_id: 5,
  },
  {
    file_name: "水道メーター2.shp",
    file_path: "dummy-data.csv",
    job_results_id: 6,
  },
];
