import {
  makeStyles,
  tokens,
  Button,
  typographyStyles,
} from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { Table, type ColumnDefinition } from "../../../../components/ui/table";
import { Pagenation } from "../../../../components/ui/pagenation";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
  },
  historyBack: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    cursor: "pointer",
  },
  previewWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingVerticalXXL,
    maxWidth: "1382px",
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  preview: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
  },
  button: {
    borderRadius: "100px",
    height: "32px",
    width: "120px",
  },
  tableContainer: {
    overflowX: "auto",
    maxHeight: "500px",
    width: "100%",
  },
  text: typographyStyles.subtitle2,
  pagenation: {
    display: "flex",
    justifyContent: "flex-start",
  },
});

// サンプルデータ
const data: PreviewData[] = [
  {
    address: "東京都千代田区丸の内1-1",
    waterNumber: "123456",
    meterNumber: "654321",
    townArea: "丸の内1丁目",
    vacantHouseProbability: 0.2,
  },
  {
    address: "東京都渋谷区渋谷2-2",
    waterNumber: "789012",
    meterNumber: "210987",
    townArea: "渋谷2丁目",
    vacantHouseProbability: 0.5,
  },
];

// カラム定義
const columns: ColumnDefinition<PreviewData>[] = [
  {
    key: "address",
    name: "住所",
    style: { width: "150px" },
  },
  {
    key: "waterNumber",
    name: "水道番号",
    style: { width: "150px" },
  },
  {
    key: "meterNumber",
    name: "メーター番号",
    style: { width: "150px" },
  },
  {
    key: "townArea",
    name: "町丁目",
    style: { width: "150px" },
  },
  {
    key: "vacantHouseProbability",
    name: "空き家確率",
    style: { width: "150px" },
    onRender: (item) => `${(item.vacantHouseProbability * 100).toFixed(2)}%`,
  },
  {
    key: "address",
    name: "アドレス",
    style: { width: "150px" },
  },
  {
    key: "address",
    name: "アドレス",
    style: { width: "150px" },
  },
];

interface PreviewData {
  address: string;
  waterNumber: string;
  meterNumber: string;
  townArea: string;
  vacantHouseProbability: number;
}

export function JobPreview(): JSX.Element {
  const styles = useStyles();
  const handleBackToResultsClick = (): void => {
    window.history.back();
  };
  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitPerPageChange = (newLimit: number): void => {
    setLimitPerPage(newLimit);
    setPage(1);
  };

  const paginatedData = data.slice(
    (page - 1) * limitPerPage,
    page * limitPerPage,
  );

  return (
    <div className={styles.root}>
      <div className={styles.historyBack} onClick={handleBackToResultsClick}>
        <ArrowLeftRegular />
        処理結果に戻る
      </div>
      <h2 className={styles.heading}>ファイルのプレビュー</h2>
      <div className={styles.previewWrapper}>
        <div className={styles.preview}>
          <div className={styles.text}>
            モデル「{"#{モデル名}"}」, ファイル「{"#{ファイル名}"}
            」を使っての空き家分析処理
          </div>
          <Button className={styles.button}>ダウンロード</Button>
        </div>

        <div className={styles.tableContainer}>
          <Table columns={columns} items={paginatedData} />
        </div>
        <div className={styles.pagenation}>
          <Pagenation
            handleLimitPerPageChange={handleLimitPerPageChange}
            handlePageChange={handlePageChange}
            limitPerPage={limitPerPage}
            page={page}
          />
        </div>
      </div>
    </div>
  );
}
