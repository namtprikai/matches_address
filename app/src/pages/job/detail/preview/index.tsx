import {
  makeStyles,
  tokens,
  Button,
  typographyStyles,
} from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Table, type ColumnDefinition } from "../../../../components/ui/table";
import { Pagination } from "../../../../components/ui/pagination";
import { useFetchBuildingPreview } from "../../../../hooks/use-fetch-preview-data";
import { useFetchModelFiles } from "../../../../hooks/use-fetch-model-files";

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
    maxWidth: "calc(100vw - 132px)",
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
  headerColumn: {
    width: "150px",
  },
});

interface PreviewData {
  normalized_address: string;
  water_supply_number: string;
  area_group: string;
  predicted_probability: number;
}

export function JobPreview(): JSX.Element {
  const styles = useStyles();
  const handleBackToResultsClick = (): void => {
    window.history.back();
  };
  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);

  const { id } = useParams<{ id: string }>();
  const dataSetResultId = Number(id);

  const { data } = useFetchBuildingPreview(dataSetResultId);
  const { data: modelData } = useFetchModelFiles();

  const matchedModel = modelData?.find((model) => model.id === dataSetResultId);
  const modelName = matchedModel?.file_name ?? "#{モデル名}";
  const fileName = matchedModel?.file_path ?? "#{ファイル名}";

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitPerPageChange = (newLimit: number): void => {
    setLimitPerPage(newLimit);
    setPage(1);
  };

  const paginatedData = data?.slice(
    (page - 1) * limitPerPage,
    page * limitPerPage,
  );

  // カラム定義
  const columns: ColumnDefinition<PreviewData>[] = [
    {
      key: "normalized_address",
      name: "住所",
      className: useStyles().headerColumn,
    },
    {
      key: "water_supply_number",
      name: "水道番号",
      className: useStyles().headerColumn,
    },
    {
      key: "area_group",
      name: "町丁目",
      className: useStyles().headerColumn,
    },
    {
      key: "predicted_probability",
      name: "空き家確率",
      className: useStyles().headerColumn,
      onRender: (item) => `${item.predicted_probability.toFixed(2)}%`,
    },
  ];

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
            モデル「{modelName}」, ファイル「{fileName}」
            を使っての空き家分析処理
          </div>
          <Button className={styles.button}>ダウンロード</Button>
        </div>

        <div className={styles.tableContainer}>
          <Table columns={columns} items={paginatedData ?? []} />
        </div>
        <div className={styles.pagenation}>
          <Pagination
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
