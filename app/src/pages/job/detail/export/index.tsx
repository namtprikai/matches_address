import { makeStyles, tokens } from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { useNavigate, useParams } from "react-router-dom";
import { downloadFile } from "../../../../utils/download-file";
import { useFetchJobResults } from "../../../../hooks/use-fetch-job-results";
import { Button } from "../../../../components/ui/button";
import { useFetchJobs } from "../../../../hooks/use-fetch-jobs";
import { useFetchDataSetResultItem } from "../../../../hooks/use-fetch-data-set-result-item";

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
  restartButtonWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    height: "68px",
    width: "100%",
    padding: tokens.spacingHorizontalXXL,
  },
});

export function ExportDetail(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: jobResultsData } = useFetchJobResults({ jobId: Number(id) });
  const { data: job } = useFetchJobs(Number(id));

  const dataSetResultId =
    job && job.length > 0 && job[0].parameters.parameterType === "export"
      ? job[0].parameters.data_set_results_id
      : null;
  const { data: dataSetResult } = useFetchDataSetResultItem({
    dataSetResultId,
  });

  const handleBack = (): void => {
    navigate(-1);
  };

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
          <span className={styles.message}>
            {dataSetResult &&
              dataSetResult.length > 0 &&
              `${dataSetResult[0].title}の`}
            判定結果のダウンロード準備が完了しました。
          </span>
          <div className={styles.buttonWrapper}>
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
      </div>
      <div className={styles.restartButtonWrapper}>
        <Button appearance="primary" onClick={() => navigate(`/job`)}>
          処理一覧へ
        </Button>
      </div>
    </div>
  );
}
