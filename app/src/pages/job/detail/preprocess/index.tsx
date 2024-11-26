import {
  Card,
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@fluentui/react-components";
import { ErrorCircleFilled, ArrowLeftRegular } from "@fluentui/react-icons";
import { useNavigate, useParams } from "react-router-dom";
import { DialogSaveWithName } from "../../../../components/dialog-save-with-name";
import { useFetchJobTasks } from "../../../../hooks/use-fetch-job-tasks";
import { type SelectJobTask } from "../../../../schema";
import { downloadFile } from "../../../../utils/download-file";
import { useFetchJobResults } from "../../../../hooks/use-fetch-job-results";
import { useDialogState } from "../../../../hooks/use-dialog-state";
import { Button } from "../../../../components/ui/button";
import { useFetchJobs } from "../../../../hooks/use-fetch-jobs";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 48px)",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
    display: "flex",
    width: "fit-content",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  content: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "300px",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    gap: tokens.spacingVerticalXL,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  headerCell: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  tableCell: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase200,
  },
  successRateCell: {
    display: "flex",
    alignItems: "center",
    fontWeight: tokens.fontWeightBold,
    color: "#09583B",
  },
  result: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: "#ecf2ef",
    borderRadius: tokens.borderRadiusSmall,
  },
  message: {
    color: "#09583B",
  },
  buttonWrapper: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
  },
  errorIcon: {
    color: "#6264A7",
  },
  restartButtonWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    height: "68px",
    width: "100%",
    padding: tokens.spacingHorizontalXXL,
  },
  noData: {
    color: "#616161",
    fontSize: tokens.fontSizeBase300,
  },
  saveWithNameButton: {
    backgroundColor: "#09583B",
    color: "#fff",
    "&:hover": {
      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    },
  },
});

/**
 * @todo PreprocessTypeの日本語表現を追加する
 * https://github.com/eukarya-inc/links-akiya/issues/447
 * */
const PreprocessTypeMap: {
  [key in Exclude<SelectJobTask["preprocess_type"], null>]: string;
} = {
  e012: "e012",
  e013: "e013",
  e014: "e014",
  e016: "e016",
};

export function PreprocessDetail(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data } = useFetchJobTasks({ jobId: Number(id) });
  const { data: jobResultsData } = useFetchJobResults({ jobId: Number(id) });
  const { data: job, mutate } = useFetchJobs(Number(id));

  const dialogState = useDialogState();

  const hasData = data && data.length > 0;

  const handlePreviewClick = (): void => {
    navigate(`/job/preview/${id}`);
  };

  const handleBack = (): void => {
    navigate(-1);
  };

  const isNamed = job && job[0].is_named;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.root}>
        <h2 className={styles.heading}>
          <Button
            appearance="subtle"
            icon={<ArrowLeftRegular />}
            onClick={handleBack}
          />
          処理結果
        </h2>

        <div className={styles.result}>
          <span className={styles.message}>処理が完了しました。</span>
          <div className={styles.buttonWrapper}>
            <Button
              className={isNamed ? "" : styles.saveWithNameButton}
              disabled={isNamed}
              onClick={() => {
                dialogState.setIsOpen(true);
              }}
            >
              名前をつけて保存
            </Button>
            <DialogSaveWithName
              dialogState={dialogState}
              onSave={async (inputValue: string) => {
                if (!jobResultsData) return;
                await window.ipcRenderer.invoke("createNormalizedDatasets", {
                  jobId: jobResultsData.job_id,
                  insertParams: {
                    file_name: inputValue,
                    file_path: jobResultsData.file_path,
                    job_results_id: jobResultsData.id,
                  },
                });
                await mutate();
              }}
            />

            <Button onClick={handlePreviewClick}>プレビューを見る</Button>
            <Button
              onClick={async () => {
                if (!jobResultsData) return;
                await downloadFile(jobResultsData.file_path);
              }}
            >
              ダウンロード
            </Button>
          </div>
        </div>

        <Card className={styles.content}>
          {hasData ? (
            <Table className={styles.table}>
              <TableHeader className={styles.tableHeader}>
                <TableRow>
                  <TableHeaderCell className={styles.headerCell}>
                    処理の種類
                  </TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>
                    指標
                  </TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>
                    成功率
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className={styles.tableCell}>
                      {item.preprocess_type
                        ? PreprocessTypeMap[item.preprocess_type]
                        : "不明な処理"}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {item.preprocess_type &&
                        (item.preprocess_type ===
                        "e013" /** 仮: @todo 指標の対応を確認して修正する https://github.com/eukarya-inc/links-akiya/issues/448 */
                          ? "緯度経度付与率"
                          : "結合率")}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.successRateCell}>
                        {getIndexRate(item)}
                        {item.error_code && (
                          <ErrorCircleFilled className={styles.errorIcon} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className={styles.noData}>
              現在表示できる処理結果はありません
            </div>
          )}
        </Card>
      </div>
      <div className={styles.restartButtonWrapper}>
        <Button appearance="primary" onClick={() => navigate("/job/restart")}>
          再実行へ
        </Button>
      </div>
    </div>
  );
}

// 成功率を取得する関数
function getIndexRate(item: SelectJobTask): string {
  if (item.result?.taskResultType === "preprocess") {
    return item.result.joining_rate;
  } else {
    return "N/A";
  }
}
