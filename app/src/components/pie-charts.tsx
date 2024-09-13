import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../config/chart-colors";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import {
  type SelectDataSetDetailBuilding,
  type SelectDataSetDetailArea,
} from "../schema";
import { type GroupingCondition } from "../utils/subquery-grouping";

export type PieChartProps = {
  resultId: number;
  groupingConditions?: GroupingCondition[];
  filterByYear: {
    startValue: number | undefined;
    endValue: number | undefined;
  };
} & (
  | {
      type: "building";
      x: keyof SelectDataSetDetailBuilding;
      y: keyof SelectDataSetDetailBuilding;
    }
  | {
      type: "area";
      x: keyof SelectDataSetDetailArea;
      y: keyof SelectDataSetDetailArea;
    }
);

export const PieChart = ({
  resultId,
  type,
  x,
  y,
  groupingConditions,
  filterByYear,
}: PieChartProps): JSX.Element => {
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
