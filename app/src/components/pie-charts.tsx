import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
} from "recharts";
import { type ChartAccepatbleType } from "../@types/charts";
import { Label } from "../config/label-map";
import { CHART_COLORS } from "../config/chart-colors";

export interface PieChartProps<T> {
  keyColumn: {
    key: keyof T;
    type: "string" | "number";
    label: string;
  };
  column: {
    key: keyof T;
    type: "string" | "number";
    label: string;
  };
  data: T[];
}

export const PieChart = <T extends ChartAccepatbleType>({
  keyColumn,
  column,
  data,
}: PieChartProps<T>): JSX.Element => {
  const chartData = data.map((row) => {
    return {
      name: row[keyColumn.key],
      [Label[column.key as keyof typeof Label]]: row[column.key],
    };
  });
  return (
    <ResponsiveContainer height={400} width="100%">
      <RePieChart height={400} width={400}>
        <RePie
          cx="50%"
          cy="50%"
          data={chartData}
          dataKey={Label[column.key as keyof typeof Label]}
          labelLine={false}
          nameKey="name"
          startAngle={0}
        >
          {chartData.map((_, index) => {
            return (
              <ReCell
                key={index}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            );
          })}
        </RePie>
        <ReLegend align="right" layout="vertical" verticalAlign="middle" />
      </RePieChart>
    </ResponsiveContainer>
  );
};
