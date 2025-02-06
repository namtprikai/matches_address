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
import { CHART_COLORS } from "../../config/chart-colors";
import { Pagination } from "../ui/pagination";
import { useFetchBarChartProps } from "../../bi-modules/hooks/use-fetch-bar-chart-props";
import { type BarView } from "../../bi-modules/interfaces/view";

type Props = {
  view: BarView;
};

export const ViewBar = ({ view }: Props): JSX.Element => {
  /** @fixme useFetchが不要回数呼び出されていそう */
  const { chartProps, pagination } = useFetchBarChartProps({
    view,
  });

  const xAxis = view.parameters.find((p) => p.key === "xAxis");
  const yAxis = view.parameters.find((p) => p.key === "yAxis");

  /** @todo どこからくる値なのか確認。本来はview.parameters.find((p) => p.key === "group_aggregation")?.value;みたいな感じ？ */
  const groupingCalc = "count";

  const data = chartProps.data.map((d) => ({
    ...d,
    y: chartProps.yAxisColumn.unit === "%" ? Math.floor(d.y * 1000) / 10 : d.y,
  }));

  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeToolTip, setActiveToolTip] = useState<boolean>(false);

  // カラムが設定されていない場合はエラーを表示
  if (!xAxis || !yAxis) {
    return <div>パラメーターの値を正しく設定してください</div>;
  }

  // フィルタ結果の値が空の場合はエラーを表示
  if (data.length === 0) {
    return <div>データがありません</div>;
  }

  return (
    <div>
      <Pagination {...pagination} />

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
          <ReXAxis dataKey={"x"} unit={chartProps.xAxisColumn.unit} />
          <ReYAxis
            dataKey={"y"}
            unit={groupingCalc === "count" ? "件" : chartProps.yAxisColumn.unit}
          />
          <ReTooltip
            active={activeToolTip}
            cursor={false}
            isAnimationActive={false}
            position={tooltipPosition}
          />
          <ReCartesianGrid vertical={false} />
          <ReLegend />
          <ReBar
            dataKey={"y"}
            fill={CHART_COLORS.primary} // tokensに存在しない値
            name={chartProps.yAxisColumn.label} // Legend（凡例）でも利用される
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
            unit={chartProps.yAxisColumn.unit}
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
    </div>
  );
};
