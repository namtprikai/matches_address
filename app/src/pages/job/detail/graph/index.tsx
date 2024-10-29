import {
  makeStyles,
  tokens,
  Button,
  Text,
  typographyStyles,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { ArrowLeftRegular } from "@fluentui/react-icons";
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
    display: "flex",
    width: "fit-content",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    ":hover": {
      cursor: "pointer",
    },
    ...typographyStyles.subtitle1,
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
  graphWrapper: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  radarChartContainer: {
    backgroundColor: "#fff",
    padding: tokens.spacingVerticalXXL,
    width: "448px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
  },
  radarChartTitle: typographyStyles.subtitle2,
  detail: {
    backgroundColor: "#FDF7F8",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusSmall,
    width: "100%",
  },
});

export function JobGraph(): JSX.Element {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleBack = (): void => {
    navigate(-1);
  };

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

  // RadarChart 用のデータ
  const radarData = [
    { subject: "正解率", A: 85 },
    { subject: "精度", A: 80 },
    { subject: "F値", A: 75 },
    { subject: "再現率", A: 90 },
    { subject: "特異率", A: 70 },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.root}>
        <div className={styles.heading} onClick={handleBack}>
          <ArrowLeftRegular />
          処理結果
        </div>

        <div className={styles.result}>
          <span className={styles.message}>処理が完了しました。</span>
          <div className={styles.buttonWrapper}>
            <DialogSaveWithName />
            <Button className={styles.button}>ダウンロード</Button>
          </div>
        </div>

        <div className={styles.graphWrapper}>
          {/* RadarChart */}
          <div className={styles.radarChartContainer}>
            <div className={styles.titleWrapper}>
              <span className={styles.radarChartTitle}>
                処理結果のパラメーター
              </span>
            </div>
            <RadarChart
              cx={200}
              cy={200}
              data={radarData}
              height={400}
              outerRadius={150}
              width={400}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                dataKey="A"
                fill="#8884d8"
                fillOpacity={0.6}
                name="指標"
                stroke="#8884d8"
              />
              <Tooltip />
            </RadarChart>
            <div className={styles.detail}>
              学習データ量が少なすぎます。正答率を上げるためには、〇〇以上のデータに修正して再実行をしてください。
            </div>
          </div>
          {/* 棒グラフ */}
          <div className={styles.columnContainer}>
            <span className={styles.columnTitle}>重要度の高いカラム</span>
            <div className={styles.chartContainer}>
              {/* Y軸のラベル */}
              <div className={styles.yAxisLabel}>
                {chartData.map((data, index) => (
                  <Text key={index} className={styles.yAxisLabelText}>
                    {data.label}
                  </Text>
                ))}
              </div>
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
