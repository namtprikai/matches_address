import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  Bar as ReBar,
  Cell as ReCell,
  CartesianGrid as ReCartesianGrid,
} from "recharts";
import { useState } from "react";
import { CHART_COLORS, CHART_COLORS } from "../config/chart-colors";
import { type ChartProps } from "../@types/charts";
import { CustomTooltip } from "./custom-tooltip";

export type BarChartProps = ChartProps;

export const BarChart = ({
  xAxisColumn,
  yAxisColumn,
  data,
}: BarChartProps): JSX.Element => {
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeToolTip, setActiveToolTip] = useState<boolean>(false);

  return (
    <ResponsiveContainer height={400} width="100%">
      <ReBarChart
        data={data}
        onMouseLeave={() => {
          setActiveToolTip(false);
        }}
        onMouseMove={(data, _) => {
          if (
            data.activeTooltipIndex === undefined ||
            data.isTooltipActive === undefined
          ) {
            return;
          }
          setActiveIndex(data.activeTooltipIndex);
          setTooltipPosition((prev) => {
            if (data.activeCoordinate === undefined) {
              return prev;
            }

            return {
              x: data.activeCoordinate.x,
              y: prev.y,
            };
          });
          setActiveToolTip(data.isTooltipActive);
        }}
      >
        <ReXAxis dataKey={"x"} unit={xAxisColumn.unit} />
        <ReYAxis dataKey={"y"} unit={yAxisColumn.unit} />
        <ReTooltip
          active={activeToolTip}
          // @ts-expect-error 内部処理で適切なPropsが渡されるが型定義が不足しているためエラーが出る
          content={<CustomTooltip />}
          cursor={false}
          isAnimationActive={false}
          position={tooltipPosition}
        />
        <ReCartesianGrid vertical={false} />
        <ReLegend />
        <ReBar
          dataKey={"y"}
          fill={CHART_COLORS.primary} // tokensに存在しない値
          onMouseMove={(data, _) => {
            setTooltipPosition((prev) => {
              if (data.tooltipPosition === undefined) {
                return prev;
              }

              return {
                x: prev.x,
                y: data.y,
              };
            });
          }}
          unit={yAxisColumn.unit}
        >
          {data.map((_, index) => (
            <ReCell
              key={`cell-${index}`}
              cursor="pointer"
              fill={
                index === activeIndex && activeToolTip
                  ? CHART_COLORS.teritiary
                  : CHART_COLORS.primary
              }
            />
          ))}
        </ReBar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};
