import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  Tooltip as ReTooltip,
  Line as ReLine,
  Legend as ReLegend,
  CartesianGrid as ReCartesianGrid,
} from "recharts";
import {
  tokens,
  Tooltip as FUIToolTip,
  makeStyles,
} from "@fluentui/react-components";
import { type ChartAccepatbleType } from "../@types/charts";
import { LanguageMap } from "../lang";
import { GRAPH_COLORS } from "../config/chart-colors";

export interface LineChartProps<T> {
  xColumn: {
    key: keyof T;
    type: "string" | "number";
    label: string;
    unit?: string;
  };
  yColumn: {
    key: keyof T;
    type: "string" | "number";
    label: string;
    unit?: string;
  };
  data: T[];
}

//
const CustomizedDot = ({
  cx,
  cy,
  stroke,
}: {
  cx: number;
  cy: number;
  stroke: string;
  payload: { value: number };
  value: number;
}): JSX.Element => {
  return (
    <svg
      fill={stroke}
      height={8}
      viewBox="0 0 8 8"
      width={8}
      x={cx - 4}
      y={cy - 4}
    >
      <circle
        cx={4}
        cy={4}
        fill={tokens.colorNeutralBackground1}
        r={3}
        stroke={stroke}
        strokeWidth={2}
      />
    </svg>
  );
};

const useStyles = makeStyles({
  tooltip: {
    backgroundColor: tokens.colorNeutralForeground2,
    color: tokens.colorNeutralForegroundInverted,
    fontSize: tokens.fontSizeBase200,
    padding: `5px ${tokens.spacingHorizontalM}`, //tokensに存在しない値
    boxShadow: tokens.shadow8,
    borderRadius: "3px", // tokensに存在しない値
  },
});

const CustomizedActiveDot = ({
  cx,
  cy,
  stroke,
  value,
}: {
  cx: number;
  cy: number;
  stroke: string;
  payload: { value: number; unit: string | undefined }[];
  value: number;
}): JSX.Element => {
  const styles = useStyles();

  return (
    <FUIToolTip
      content={{
        children: value,
        className: styles.tooltip,
      }}
      positioning={"above"}
      relationship="label"
      visible
      withArrow
    >
      <svg
        fill={stroke}
        height={8}
        viewBox="0 0 8 8"
        width={8}
        x={cx - 4}
        y={cy - 4}
      >
        <circle
          cx={4}
          cy={4}
          fill={GRAPH_COLORS.primary}
          r={3}
          stroke={GRAPH_COLORS.teritiary}
          strokeWidth={2}
        />
      </svg>
    </FUIToolTip>
  );
};

export const LineChart = <T extends ChartAccepatbleType>({
  xColumn,
  yColumn,
  data,
}: LineChartProps<T>): JSX.Element => {
  const chartData = data.map((row) => {
    return {
      name: row[xColumn.key],
      [LanguageMap.DATA_SET_DETAIL_BUILDINGS[
        xColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
      ]]: row[xColumn.key],
      [LanguageMap.DATA_SET_DETAIL_BUILDINGS[
        yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
      ]]: row[yColumn.key],
    };
  });

  return (
    <ResponsiveContainer height={400} width="100%">
      <ReLineChart data={chartData}>
        <ReXAxis
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              xColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          unit={xColumn.unit}
        />
        <ReYAxis
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          unit={yColumn.unit}
        />
        <ReTooltip
          wrapperStyle={{
            display: "none",
          }}
        />
        <ReCartesianGrid vertical={false} />
        <ReLine
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          activeDot={<CustomizedActiveDot />}
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          dot={<CustomizedDot />}
          stroke={GRAPH_COLORS.primary}
          strokeWidth={2}
        />
        <ReLegend />
      </ReLineChart>
    </ResponsiveContainer>
  );
};
