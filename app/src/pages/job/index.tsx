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
import { useNavigate, Link } from "react-router-dom";
import { ErrorCircleFilled } from "@fluentui/react-icons";
import { useFetchJobLists } from "../../hooks/use-fetch-job-lists";
import { type SelectJob } from "../../schema";
import { formatDate } from "../../utils/format-date";
import {
  TYPE_DISPLAY_MAP,
  type JobType,
} from "../../config/job-type-display-map";
import { DebugCreateButtons } from "./detail/_debug-create-buttuns";

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
  statusCell: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecf2ef",
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: "#09583B",
    padding: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
  },
  noData: {
    color: "#616161",
    fontSize: tokens.fontSizeBase300,
  },
});

export function Job(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();
  const { data } = useFetchJobLists();

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
                return (
                  <TableRow
                    key={item.id}
                    className={styles.tableRow}
                    onClick={() => navigate(`/job/detail/${item.id}`)}
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
                      <span
                        className={styles.statusCell}
                        style={
                          statusInfo.color
                            ? { color: statusInfo.color }
                            : undefined
                        }
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.statusCell}>
                        {item.status === "completed" ? "完了" : "未"}
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
      {/* TODO: 後で消す */}
      <Link to={"/job/preview"}>開発用: プレビュー</Link>
      <Link to="/graph">開発用: モデル精度表示</Link>
    </div>
  );
}

// MEMO: statusが決まりきっていないので仮置き progress_percent取得できるならcomputedに表示なる
function getStatusInfo(status: string | null | undefined): {
  label: string;
  color?: string;
  icon?: JSX.Element;
} {
  if (!status || status === "error") {
    return {
      label: "エラー",
      icon: <ErrorCircleFilled style={{ marginRight: "4px" }} />,
    };
  } else if (status === "in_progress") {
    return { label: "進行中", color: "#6264A7" };
  } else if (status === "completed") {
    return { label: "完了" };
  } else {
    return { label: status };
  }
}
