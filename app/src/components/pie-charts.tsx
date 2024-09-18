import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../config/chart-colors";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { type FilterDataSetForChartArgs } from "../ipc-main-listeners/filter-data-set-for-chart";

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

  return (
    <ResponsiveContainer height={400} width="100%">
      <RePieChart height={400} width={400}>
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
