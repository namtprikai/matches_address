import {
  PieChart as RePieChart,
  Legend as ReLegend,
  Pie as RePie,
  Cell as ReCell,
} from "recharts";
import { tokens } from "@fluentui/react-components";
import { type ChartAccepatbleType } from "../@types/charts";
import { Label } from "../config/label-map";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}): JSX.Element => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      dominantBaseline="central"
      fill="white"
      fontWeight={tokens.fontWeightBold}
      textAnchor={x > cx ? "start" : "end"}
      x={x}
      y={y}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderLegend = (props): JSX.Element => {
  const { payload } = props;

  console.log(payload[0]);

  return (
    <ul>
      {payload.map((entry, index) => (
        <li key={`item-${index}`}>{entry.value}</li>
      ))}
    </ul>
  );
};

export const PieChart = <T extends ChartAccepatbleType>({
  keyColumn,
  colmuns,
  data,
  colors,
}: {
  keyColumn: keyof T;
  colmuns: (keyof T)[];
  data: T[];
  colors: {
    [k in keyof T]?: string;
  };
}): JSX.Element => {
  const chartData = data.map((row) => {
    const kvPairs = colmuns.map((column) => {
      return [Label[column as keyof typeof Label], row[column as keyof T]];
    });
    return {
      name: row[keyColumn],
      ...Object.fromEntries(kvPairs),
    };
  });
  return (
    <RePieChart height={400} width={400}>
      {colmuns.map((column, index) => {
        return (
          <RePie
            key={column as string}
            cx="50%"
            cy="50%"
            data={chartData}
            dataKey={Label[column as keyof typeof Label]}
            fill={colors[column]}
            innerRadius={index * 2 * 30}
            label={renderCustomizedLabel}
            labelLine={false}
            nameKey="name"
            outerRadius={(index + 1) * 2 * 30}
            startAngle={0}
          >
            {chartData.map((entry, index) => {
              return <ReCell key={index} fill={colors[column]} />;
            })}
          </RePie>
        );
      })}
      <ReLegend content={renderLegend} />
    </RePieChart>
  );
};
