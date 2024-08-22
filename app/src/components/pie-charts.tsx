import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../config/chart-colors";
import { type ChartProps } from "../@types/charts";

export type PieChartProps = ChartProps;

export const PieChart = ({ data }: PieChartProps): JSX.Element => {
  return (
    <ResponsiveContainer height={400} width="100%">
      <RePieChart height={400} width={400}>
        <RePie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="y"
          labelLine={false}
          nameKey="name"
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
