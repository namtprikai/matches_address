import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../config/chart-colors";
import {
  type data_set_detail_areas,
  type data_set_detail_buildings,
} from "../schema";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";

export type PieChartProps = {
  resultId: number;
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

export const PieChart = ({
  resultId,
  type,
  x,
  y,
}: PieChartProps): JSX.Element => {
  // @ts-expect-error TODO: Unionが正しく分配されない
  const { chartProps } = useFetchFilterDataSetForChart({
    resultId,
    type,
    x,
    y,
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
      <RePieChart height={400} width={400}>
        <RePie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="y"
          labelLine={false}
          nameKey={"y"}
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
