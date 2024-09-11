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
import {
  type data_set_detail_areas,
  type data_set_detail_buildings,
} from "../schema";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { type GroupingCondition } from "../utils/subquery-grouping";

export type LineChartProps = {
  resultId: number;
  groupingConditions?: GroupingCondition[];
  filterByYear: {
    startValue: number | undefined;
    endValue: number | undefined;
  };
} & (
  | {
      type: "building";
      x: keyof typeof data_set_detail_buildings.$inferSelect;
      y: keyof typeof data_set_detail_buildings.$inferSelect;
    }
  | {
      type: "area";
      x: keyof typeof data_set_detail_areas.$inferSelect;
      y: keyof typeof data_set_detail_areas.$inferSelect;
    }
);

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
  resultId,
  type,
  x,
  y,
  groupingConditions,
  filterByYear,
}: LineChartProps): JSX.Element => {
  // @ts-expect-error TODO: Unionが正しく分配されない
  const { chartProps } = useFetchFilterDataSetForChart({
    resultId,
    type,
    x,
    y,
    groupingConditions,
    filterByYear,
  });

  const data = chartProps.data;

  if (x == null || y == null) {
    return <div>パラメーターの値を正しく設定してください</div>;
  }

  if (data.length === 0) {
    return <div>データがありません</div>;
  }

  return (
    <ResponsiveContainer height={400} width="100%">
      <ReLineChart data={data}>
        <ReXAxis dataKey={"x"} unit={chartProps.xAxisColumn.unit} />
        <ReYAxis dataKey={"y"} unit={chartProps.yAxisColumn.unit} />
        <ReTooltip
          wrapperStyle={{
            display: "none",
          }}
        />
        <ReCartesianGrid vertical={false} />
        <ReLine
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          activeDot={<CustomizedActiveDot unit={chartProps.yAxisColumn.unit} />}
          dataKey={"y"}
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          dot={<CustomizedDot />}
          name={chartProps.yAxisColumn.label}
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          unit={chartProps.yAxisColumn.unit}
        />
        <ReLegend />
      </ReLineChart>
    </ResponsiveContainer>
  );
};
