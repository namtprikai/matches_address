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
import { type ChartAccepatbleType } from "../@types/charts";
import { LanguageMap } from "../lang";
import { GRAPH_COLORS } from "../config/chart-colors";
import { CustomTooltip } from "./custom-tooltip";

export interface PieChartProps<T> {
  xColumn: {
    key: keyof T;
    type: "string" | "number";
    label: string;
    unit?: string;
  };
  yColumn: {
    key: keyof T;
    type: "string" | "number";
    label: string;
    unit?: string;
  };
  data: T[];
}

export const BarChart = <T extends ChartAccepatbleType>({
  xColumn,
  yColumn,
  data,
}: PieChartProps<T>): JSX.Element => {
  const chartData = data.map((row) => {
    return {
      name: row[xColumn.key],
      [LanguageMap.DATA_SET_DETAIL_BUILDINGS[
        xColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
      ]]: row[xColumn.key],
      [LanguageMap.DATA_SET_DETAIL_BUILDINGS[
        yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
      ]]: row[yColumn.key],
    };
  });

  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeToolTip, setActiveToolTip] = useState<boolean>(false);

  return (
    <ResponsiveContainer height={400} width="100%">
      <ReBarChart
        data={chartData}
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
        <ReXAxis
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              xColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          unit={xColumn.unit}
        />
        <ReYAxis
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          unit={yColumn.unit}
        />
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
          dataKey={
            LanguageMap.DATA_SET_DETAIL_BUILDINGS[
              yColumn.key as keyof typeof LanguageMap.DATA_SET_DETAIL_BUILDINGS
            ]
          }
          fill={GRAPH_COLORS.primary} // tokensに存在しない値
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
          unit={yColumn.unit}
        >
          {chartData.map((_, index) => (
            <ReCell
              key={`cell-${index}`}
              cursor="pointer"
              fill={
                index === activeIndex && activeToolTip
                  ? GRAPH_COLORS.teritiary
                  : GRAPH_COLORS.primary
              }
            />
          ))}
        </ReBar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};
