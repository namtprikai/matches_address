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
import { CHART_COLORS } from "../config/chart-colors";
import { type ChartProps } from "../@types/charts";

export type LineChartProps = ChartProps;
//
const CustomizedDot = ({
  cx,
  cy,
  stroke,
}: {
  cx: number;
  cy: number;
  stroke: string;
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
  unit,
}: {
  cx: number;
  cy: number;
  stroke: string;
  value: number;
  unit?: string;
}): JSX.Element => {
  const styles = useStyles();

  const labelText = unit ? `${value}${unit}` : value;

  return (
    <FUIToolTip
      content={{
        children: labelText,
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
          fill={CHART_COLORS.primary}
          r={3}
          stroke={CHART_COLORS.teritiary}
          strokeWidth={2}
        />
      </svg>
    </FUIToolTip>
  );
};

export const LineChart = ({
  data,
  xAxisColumn,
  yAxisColumn,
}: LineChartProps): JSX.Element => {
  return (
    <ResponsiveContainer height={400} width="100%">
      <ReLineChart data={data}>
        <ReXAxis dataKey={"x"} unit={xAxisColumn.unit} />
        <ReYAxis dataKey={"y"} unit={yAxisColumn.unit} />
        <ReTooltip
          wrapperStyle={{
            display: "none",
          }}
        />
        <ReCartesianGrid vertical={false} />
        <ReLine
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          activeDot={<CustomizedActiveDot unit={yAxisColumn.unit} />}
          dataKey={"y"}
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          dot={<CustomizedDot />}
          name={yAxisColumn.label}
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          unit={yAxisColumn.unit}
        />
        <ReLegend />
      </ReLineChart>
    </ResponsiveContainer>
  );
};
