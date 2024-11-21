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
  mergeClasses,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { ErrorCircleFilled } from "@fluentui/react-icons";
import { useFetchJobs } from "../../hooks/use-fetch-jobs";
import { type SelectJob } from "../../schema";
import { formatDate } from "../../utils/format-date";
import {
  TYPE_DISPLAY_MAP,
  type JobType,
} from "../../config/job-type-display-map";
import { DebugCreateButtons } from "./_debug-create-buttuns";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
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
  tableRow: {
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      cursor: "pointer",
    },
  },
  statusCellContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  statusCell: {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    padding: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    color: "#6264A7",
    backgroundColor: "#6264a71f",
  },
  statusCellError: {
    color: "#C4314B",
    backgroundColor: "#c4314b14",
  },
  statusCellComplete: {
    color: "#09583B",
    backgroundColor: "#ecf2ef",
  },
  noData: {
    color: "#616161",
    fontSize: tokens.fontSizeBase300,
  },
});

export function Job(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();
  const { data } = useFetchJobs();

  const hasData = data && data.length > 0;

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>非同期処理一覧</h2>

      <DebugCreateButtons />

      <Card className={styles.content}>
        {hasData ? (
          <Table className={styles.table}>
            <TableHeader className={styles.tableHeader}>
              <TableRow>
                <TableHeaderCell className={styles.headerCell}>
                  処理開始日時
                </TableHeaderCell>
                <TableHeaderCell className={styles.headerCell}>
                  処理の種類
                </TableHeaderCell>
                <TableHeaderCell className={styles.headerCell}>
                  処理ステータス
                </TableHeaderCell>
                <TableHeaderCell className={styles.headerCell}>
                  保存ステータス
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: SelectJob) => {
                const statusInfo = getStatusInfo(item.status);
                /** result か null ではないかつ、 status が complete または error であればクリック(遷移)可能 */
                const clickable =
                  !(item.type === "result" || item.type === null) &&
                  (item.status === "complete" || item.status === "error");
                return (
                  <TableRow
                    key={item.id}
                    className={clickable ? styles.tableRow : ""}
                    onClick={() => {
                      if (!clickable) return;
                      navigate(`/job/detail/${item.id}/${item.type}`);
                    }}
                  >
                    <TableCell className={styles.tableCell}>
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {item.type && TYPE_DISPLAY_MAP[item.type as JobType]
                        ? TYPE_DISPLAY_MAP[item.type as JobType]
                        : "不明"}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.statusCellContainer}>
                        <span
                          className={mergeClasses(
                            styles.statusCell,
                            item.status === "error" && styles.statusCellError,
                            item.status === "complete" &&
                              styles.statusCellComplete,
                          )}
                        >
                          {statusInfo.label}
                        </span>
                        {statusInfo.icon}
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span
                        className={mergeClasses(
                          styles.statusCell,
                          styles.statusCellComplete,
                        )}
                      >
                        {item.is_named ? "完了" : "未"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className={styles.noData}>
            現在表示できる非同期処理はありません
          </div>
        )}
      </Card>
    </div>
  );
}

function getStatusInfo(status: SelectJob["status"]): {
  label: string;
  icon?: JSX.Element;
} {
  if (status === "error") {
    return {
      label: "エラー",
      icon: <ErrorCircleFilled style={{ color: "#C4314B", fontSize: 18 }} />,
    };
  } else if (status === "") {
    return { label: "進行中 0%" };
  } else if (status === "complete") {
    return { label: "完了" };
  } else {
    /** "" | "error" | "complete"以外はそのまま表示、という型表現をSchemaで書けなかったためignore */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 理由は上段の通り
    // @ts-ignore
    return {
      label: status ? `進行中 ${Math.round(status)}%` : "",
    };
  }
}
