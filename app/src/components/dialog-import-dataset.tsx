import {
  Dialog,
  tokens,
  makeStyles,
  type SelectTabData,
  type SelectTabEvent,
  TabList,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  mergeClasses,
  DialogTrigger,
} from "@fluentui/react-components";
import { ArrowSortRegular, DismissFilled } from "@fluentui/react-icons";

import { useState } from "react";
import { Tab } from "../components/ui/tab";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";
import { FileUploader } from "./ui/file-uploader/file-uploader";

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
  noDatasetWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "293px",
  },
  uploadWrap: {
    height: "325px",
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  noDataset: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  tab: {
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalNone}`,
  },
  tabList: {
    display: "flex",
    gap: tokens.spacingVerticalXL,
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalXXL}`,
  },
  tableHeader: {
    display: "block",
  },
  tableBody: {
    height: "293px",
  },
  datasetTable: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalS,
    ":hover": { cursor: "pointer" },
  },
  borderBottom: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  selectedDatasetTable: {
    border: "1px solid #6264A7",
    backgroundColor: "#E9EAF6",
  },
  datasetCell: {
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalXXL}`,
    fontSize: tokens.fontSizeBase200,
    display: "flex",
    alignItems: "center",
  },
  datasetHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
    ":hover": { cursor: "pointer" },
  },
  tableHeight: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  dataName: {
    color: "#6264A7",
    textDecoration: "underline",
  },
  disabledButton: {
    backgroundColor: "#EFF0F0",
    color: "#89949F",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#EFF0F0",
    },
  },
  dataButton: {
    height: "28px",
    backgroundColor: "#6366A7",
    color: "#FFFFFF",
    padding: "5px 22px",
  },
});

export const DialogImportDataset = (): JSX.Element => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDatasetIndex, setSelectedDatasetIndex] = useState<
    number | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const datasets = [
    { name: "modelA_akiya_search A", lastUpdated: "2024/8/31 20:32" },
    { name: "modelA_akiya_search B", lastUpdated: "2024/3/31 10:32" },
  ];

  const handleClick = (): void => {
    if (selectedDatasetIndex !== null) {
      // const dataset = datasets[selectedDatasetIndex];
      setIsDialogOpen(false);
    }
  };

  const handleTabChange = (_: SelectTabEvent, data: SelectTabData): void => {
    setSelectedTab(data.value as number);
    setSelectedDatasetIndex(null);
  };
  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button
          className={styles.dataButton}
          onClick={() => setIsDialogOpen(true)}
        >
          データを選択
        </Button>
      </DialogTrigger>
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
            ファイルをインポート
          </DialogTitle>
          <DialogContent padding={false}>
            <TabList
              className={styles.tabList}
              onTabSelect={handleTabChange}
              selectedValue={selectedTab}
            >
              <Tab className={styles.tab} value={0}>
                データセットから選択
              </Tab>
              <Tab className={styles.tab} value={1}>
                アップロード
              </Tab>
            </TabList>

            {selectedTab === 0 && (
              <>
                <Table className={styles.tableHeight}>
                  <TableHeader className={styles.tableHeader}>
                    <TableRow
                      className={`${styles.datasetTable} ${styles.borderBottom}`}
                    >
                      <TableHeaderCell
                        className={`${styles.datasetCell} ${styles.datasetHeader}`}
                      >
                        データセット名
                        <ArrowSortRegular />
                      </TableHeaderCell>
                      <TableHeaderCell
                        className={`${styles.datasetCell} ${styles.datasetHeader}`}
                      >
                        最終更新
                        <ArrowSortRegular />
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  {datasets.length > 0 ? (
                    <TableBody className={styles.tableBody}>
                      {datasets.map((dataset, index) => (
                        <TableRow
                          key={index}
                          className={mergeClasses(
                            styles.datasetTable,
                            selectedDatasetIndex === index
                              ? styles.selectedDatasetTable
                              : styles.borderBottom,
                          )}
                          onClick={() => setSelectedDatasetIndex(index)}
                        >
                          <TableCell
                            className={`${styles.datasetCell} ${styles.dataName}`}
                          >
                            {dataset.name}
                          </TableCell>
                          <TableCell className={styles.datasetCell}>
                            {dataset.lastUpdated}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  ) : (
                    <div className={styles.noDatasetWrap}>
                      <span className={styles.noDataset}>
                        現在表示できるデータセットはありません
                      </span>
                    </div>
                  )}
                </Table>
              </>
            )}

            {selectedTab === 1 && (
              <div className={styles.uploadWrap}>
                <FileUploader
                  onChange={() => {
                    return;
                  }}
                  value={null}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              className={
                selectedTab === 0 && selectedDatasetIndex === null
                  ? styles.disabledButton
                  : ""
              }
              disabled={selectedTab === 0 && selectedDatasetIndex === null}
              onClick={handleClick}
            >
              インポート
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
