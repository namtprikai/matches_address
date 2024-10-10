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
  Button,
  mergeClasses,
} from "@fluentui/react-components";

import { ErrorCircleFilled } from "@fluentui/react-icons";

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
  button: {
    borderRadius: "100px",
    height: "32px",
    padding: `5px ${tokens.spacingHorizontalXL}`,
  },
  saveWithName: {
    border: 0,
    backgroundColor: "#09583B",
    color: "#fff",
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
  restartButton: {
    backgroundColor: "#6264A7",
    color: "#fff",
    borderRadius: "100px",
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalL}`,
    height: "40px",
  },
});

const data = [
  {
    processType: "住居単位データ作成処理",
    indexRate: "結合率",
    successRate: "98%",
  },
  {
    processType: "モデル作成",
    indexRate: "緯度経度付与率",
    successRate: "20%",
  },
];

export function JobDetail(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.root}>
        <h2 className={styles.heading}>処理結果</h2>

        <div className={styles.result}>
          <span className={styles.message}>処理が完了しました。</span>
          <div className={styles.buttonWrapper}>
            <Button
              className={mergeClasses(styles.button, styles.saveWithName)}
            >
              名前をつけて保存
            </Button>
            <Button className={styles.button}>プレビューを見る</Button>
            <Button className={styles.button}>ダウンロード</Button>
          </div>
        </div>

        <Card className={styles.content}>
          {/* TODO: コンポーネントに切り出し */}
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
              {data.map((item, index) => (
                <TableRow key={index} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>
                    {item.processType}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {item.indexRate}
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <div className={styles.successRateCell}>
                      {item.successRate}
                      <ErrorCircleFilled className={styles.errorIcon} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
      <div className={styles.restartButtonWrapper}>
        <Button className={styles.restartButton}>再実行へ</Button>
      </div>
    </div>
  );
}
