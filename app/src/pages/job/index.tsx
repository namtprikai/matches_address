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
import { useNavigate } from "react-router-dom";

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
    backgroundColor: "#ecf2ef",
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: "#09583B",
    padding: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
  },
  noData: {
    color: "616161",
    fontSize: tokens.fontSizeBase300,
  },
});

const data = [
  {
    id: 1,
    startDate: "2023/10/07 10:00",
    processType: "前処理",
    processStatus: "実行中",
    saveStatus: "未保存",
  },
  {
    id: 2,
    startDate: "2023/10/06 14:30",
    processType: "モデル作成",
    processStatus: "完了",
    saveStatus: "保存済み",
  },
];

export function Job(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>非同期処理一覧</h2>

      <Card className={styles.content}>
        {/* TODO: コンポーネントに切り出し */}
        {data.length > 0 ? (
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
              {data.map((item, index) => (
                <TableRow
                  key={index}
                  className={styles.tableRow}
                  onClick={() => navigate(`/job/detail/${item.id}`)}
                >
                  <TableCell className={styles.tableCell}>
                    {item.startDate}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {item.processType}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={styles.statusCell}>
                      {item.processStatus}
                    </span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={styles.statusCell}>{item.saveStatus}</span>
                  </TableCell>
                </TableRow>
              ))}
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
