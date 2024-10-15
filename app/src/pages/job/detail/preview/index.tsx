import {
  makeStyles,
  tokens,
  Button,
  mergeClasses,
} from "@fluentui/react-components";
import { ArrowLeftRegular } from "@fluentui/react-icons";

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
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  preview: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  button: {
    borderRadius: "100px",
    height: "32px",
    width: "120px",
  },
  tableContainer: {
    overflowX: "auto",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    maxHeight: "500px",
    maxWidth: "1070px",
  },
  table: {
    borderCollapse: "collapse",
    width: "auto",
    tableLayout: "fixed",
  },
  tableCell: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: 0,
    textAlign: "center",
    width: "40px",
    height: "24px",
  },
  dataCell: {
    backgroundColor: tokens.colorNeutralStrokeOnBrand2,
  },
  headerCell: {
    backgroundColor: tokens.colorNeutralBackground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  rowHeaderCell: {
    backgroundColor: tokens.colorNeutralBackground3,
    fontWeight: tokens.fontWeightSemibold,
    position: "sticky",
    left: 0,
    zIndex: 1,
    width: "77px",
    minWidth: "77px",
    maxWidth: "77px",
    height: "24px",
  },
  columnHeaderCell: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    height: "24px",
  },
  blackCell: {
    width: "77px",
    minWidth: "77px",
    maxWidth: "77px",
    height: "24px",
  },
});

function generateColumnLabels(columnCount: number): string[] {
  const labels = [];
  for (let i = 0; i < columnCount; i++) {
    let label = "";
    let n = i;
    do {
      label = String.fromCharCode((n % 26) + 65) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    labels.push(label);
  }
  return labels;
}

const rowCount = 20; // 行数を調整
const columnCount = 26; // 列数を調整
const columnLabels = generateColumnLabels(columnCount);

// サンプルデータの生成
const data = Array.from({ length: rowCount }, () =>
  Array.from({ length: columnCount }, () => ""),
);

export function JobPreview(): JSX.Element {
  const styles = useStyles();
  const handleBackToResultsClick = (): void => {
    window.history.back();
  };

  return (
    <div className={styles.root}>
      <div className={styles.historyBack} onClick={handleBackToResultsClick}>
        <ArrowLeftRegular />
        処理結果に戻る
      </div>
      <div className={styles.previewWrapper}>
        <h2 className={styles.heading}>ファイルのプレビュー</h2>

        <div className={styles.preview}>
          <Button className={styles.button}>ダウンロード</Button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={mergeClasses(
                    styles.tableCell,
                    styles.headerCell,
                    styles.blackCell,
                  )}
                ></th>
                {columnLabels.map((label, index) => (
                  <th
                    key={index}
                    className={mergeClasses(
                      styles.tableCell,
                      styles.headerCell,
                      styles.columnHeaderCell,
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((rowData, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    className={mergeClasses(
                      styles.tableCell,
                      styles.headerCell,
                      styles.rowHeaderCell,
                    )}
                  >
                    {rowIndex + 1}
                  </td>
                  {rowData.map((cellData, colIndex) => (
                    <td
                      key={colIndex}
                      className={mergeClasses(
                        styles.tableCell,
                        styles.dataCell,
                      )}
                    >
                      {cellData}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
