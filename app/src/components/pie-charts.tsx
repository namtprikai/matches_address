import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  type TooltipProps,
} from "recharts";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { makeStyles, tokens } from "@fluentui/react-components";
import { CHART_COLORS } from "../config/chart-colors";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { type FilterDataSetForChartArgs } from "../ipc-main-listeners/filter-data-set-for-chart";

const useStyle = makeStyles({
  tooltip: {
    backgroundColor: tokens.colorNeutralForeground2,
    color: tokens.colorNeutralForegroundInverted,
    fontSize: tokens.fontSizeBase200,
    padding: `5px ${tokens.spacingHorizontalM}`, //tokensに存在しない値
    boxShadow: tokens.shadow8,
    borderRadius: "3px", // tokensに存在しない値
  },
});

export type PieChartProps = FilterDataSetForChartArgs;

export const PieChart = (props: PieChartProps): JSX.Element => {
  const { chartProps } = useFetchFilterDataSetForChart(props);

  const data = chartProps.data;

  if (props.x == null || props.y == null) {
    return <div>パラメーターの値を正しく設定してください</div>;
  }

  if (data.length === 0) {
    return <div>データがありません</div>;
  }

  const CustomTooltip = <TValue extends ValueType, TName extends NameType>(
    props: TooltipProps<TValue, TName> & {
      unit?: string;
    },
  ): JSX.Element | null => {
    const active = props.active;
    const payload = props.payload;

    const styles = useStyle();

    if (active && payload && payload.length) {
      const label = payload[0].payload["x"];
      const value = payload[0].value;

      return (
        <div className={styles.tooltip}>
          <p className="desc">
            {label}: {value}
            {props.unit ?? ""}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer height={400} width="100%">
      <RePieChart height={400} width={400}>
        <ReTooltip
          content={<CustomTooltip unit={chartProps.yAxisColumn.unit} />}
        />
        <RePie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="y"
          labelLine={false}
          nameKey={"x"}
          startAngle={0}
        >
          {data.map((_, index) => {
            return (
              <ReCell
                key={index}
                fill={
                  CHART_COLORS.repeated[index % CHART_COLORS.repeated.length]
                }
              />
            );
          })}
        </RePie>
        <ReLegend align="right" layout="vertical" verticalAlign="middle" />
      </RePieChart>
    </ResponsiveContainer>
  );
};
