import {
  makeStyles,
  tokens,
  Button,
  Text,
  typographyStyles,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { DialogSaveWithName } from "../../../../components/dialog-save-with-name";

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
    ":hover": {
      cursor: "pointer",
    },
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
  accurateContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    backgroundColor: "#fff",
    padding: tokens.spacingVerticalXXL,
  },
  columnContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    backgroundColor: "#fff",
    padding: tokens.spacingVerticalXXL,
    width: "100%",
  },
  columnTitle: typographyStyles.subtitle2,
  chartContainer: {
    width: "100%",
    marginTop: tokens.spacingVerticalL,
    position: "relative",
    display: "flex",
  },
  yAxisLabel: {
    width: "100px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
    gap: "9px",
  },
  barContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  barWrapper: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${tokens.spacingHorizontalS} 0`,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  bar: {
    height: "20px",
    backgroundColor: "#6264A7",
  },
  xAxis: {
    position: "relative",
    height: "20px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  xAxisTicks: {
    position: "relative",
    top: "-5px",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  xAxisLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  yAxisLabelText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    marginTop: tokens.spacingHorizontalS,
    height: "20px",
  },
  gaugeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: tokens.spacingVerticalXL,
    position: "relative",
    backgroundColor: "#fff",
    padding: tokens.spacingVerticalXL,
    width: "241px",
  },
  gaugeWrapper: {
    position: "relative",
    width: "220px",
    height: "110px",
    overflow: "visible",
  },
  gaugeBackground: {
    width: "100%",
    height: "200%",
    transform: "rotate(270deg)",
  },
  gaugeCircle: {
    fill: "none",
    stroke: "#E0E0E0",
    strokeWidth: "30",
    transform: "rotate(270deg)",
    transformOrigin: "center",
  },
  gaugeArc: {
    fill: "none",
    stroke: "#C4314B",
    strokeWidth: "30",
    transform: "rotate(270deg)",
    transformOrigin: "center",
  },
  gaugeText: {
    position: "absolute",
    top: "85%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#C4314B",
    ...typographyStyles.title2,
  },
  gaugeLabelLeft: {
    position: "absolute",
    top: "85%",
    left: "10%",
    transform: "translateX(-10%)",
    ...typographyStyles.caption1,
  },
  gaugeLabelRight: {
    position: "absolute",
    top: "85%",
    right: "7%",
    transform: "translateX(10%)",
    ...typographyStyles.caption1,
  },
  detail: {
    backgroundColor: "#FDF7F8",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusSmall,
    width: "241px",
  },
  graphWrapper: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
});

export function JobGraph(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleBack = (): void => {
    navigate(-1);
  };

  // ゲージメーターの値（0〜100の間）
  const gaugeValue = 15;

  // ゲージの弧の長さを計算
  const radius = 90; // 半径
  const circumference = 2 * Math.PI * radius;

  const halfCircumference = circumference / 2;
  const halfOffset = halfCircumference - (gaugeValue / 100) * halfCircumference;

  const chartData = [
    {
      label: "水道利用率",
      value: 75,
    },
    {
      label: "電力利用料",
      value: 50,
    },
    {
      label: "居住有無",
      value: 90,
    },
    {
      label: "居住有無ああああ",
      value: 10,
    },
    {
      label: "aaa",
      value: 80,
    },
    {
      label: "BBB",
      value: 30,
    },
  ];

  const xAxisLabels = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.root}>
        <h2 className={styles.heading} onClick={handleBack}>
          処理結果
        </h2>

        <div className={styles.result}>
          <span className={styles.message}>処理が完了しました。</span>
          <div className={styles.buttonWrapper}>
            <DialogSaveWithName />
            <Button className={styles.button}>ダウンロード</Button>
          </div>
        </div>

        <div className={styles.graphWrapper}>
          {/* ゲージメーター */}
          <div className={styles.accurateContainer}>
            <div className={styles.columnTitle}>正解率</div>
            <div className={styles.gaugeContainer}>
              <div className={styles.gaugeWrapper}>
                <svg
                  className={styles.gaugeBackground}
                  viewBox="0 0 220 210"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 背景の半円弧 */}
                  <circle
                    className={styles.gaugeCircle}
                    cx="110"
                    cy="110"
                    r={radius}
                    strokeDasharray={`${halfCircumference} ${circumference}`}
                    strokeDashoffset="0"
                  />
                  {/* 値を表す半円弧 */}
                  <circle
                    className={styles.gaugeArc}
                    cx="110"
                    cy="110"
                    r={radius}
                    strokeDasharray={`${halfCircumference} ${circumference}`}
                    strokeDashoffset={halfOffset}
                  />
                </svg>
                {/* メーターの中央に値を表示 */}
                <div className={styles.gaugeText}>{gaugeValue}%</div>
              </div>
              <div className={styles.gaugeLabelLeft}>0%</div>
              <div className={styles.gaugeLabelRight}>100%</div>
            </div>
            <div className={styles.detail}>
              学習データ量が少なすぎます。正答率を上げるためには、〇〇以上のデータに修正して再実行をしてください。
            </div>
          </div>

          <div className={styles.columnContainer}>
            <div className={styles.columnTitle}>重要度の高いカラム</div>
            <div className={styles.chartContainer}>
              {/* Y軸のラベル */}
              <div className={styles.yAxisLabel}>
                {chartData.map((data, index) => (
                  <Text key={index} className={styles.yAxisLabelText}>
                    {data.label}
                  </Text>
                ))}
              </div>

              {/* 棒グラフ */}
              <div style={{ flex: 1 }}>
                <div className={styles.barContainer}>
                  {chartData.map((data, index) => (
                    <div key={index} className={styles.barWrapper}>
                      <div
                        className={styles.bar}
                        style={{ width: `${data.value}%` }}
                      ></div>
                      <Text style={{ marginLeft: tokens.spacingHorizontalS }}>
                        {data.value}%
                      </Text>
                    </div>
                  ))}
                </div>

                {/* X軸 */}
                <div className={styles.xAxis}>
                  <div className={styles.xAxisTicks}>
                    {xAxisLabels.map((label, index) => (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: `${label}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        <Text className={styles.xAxisLabel}>{label}%</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.restartButtonWrapper}>
        <Button className={styles.restartButton}>再実行へ</Button>
      </div>
    </div>
  );
}
