import { eq } from "drizzle-orm";
import {
  data_set_detail_areas,
  data_set_detail_buildings,
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import { type ChartProps } from "../@types/charts";
import {
  DATA_SET_DETAIL_AREA_COLUMN_CONFIG,
  DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG,
} from "../config/data-columns";
import { formatChartValue } from "../utils/format-chart-value";
import { type IpcMainListener } from ".";

export type FilterDataSetForChartResponse = ChartProps;

export const filterDataSetForChart = ((
  _: unknown,
  {
    resultId,
    type,
    x,
    y,
  }: { resultId: number } & (
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
  ),
): FilterDataSetForChartResponse => {
  if (type === "area") {
    const all = db
      .select()
      .from(data_set_detail_areas)
      .where(eq(data_set_detail_areas.data_set_result_id, resultId))
      .all();

    // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
    const percentage = DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].percentage;

    return {
      data: all.map((row: SelectDataSetDetailArea) => {
        return {
          x: row[x] as string,
          // TODO: この辺りの型定義は別途修正が必要
          y: formatChartValue(row[y] ?? "", percentage) as number,
        };
      }),
      xAxisColumn: {
        type: "string",
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[x].unit,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[x].label,
      },
      yAxisColumn: {
        type: "number",
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].unit,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[y].label,
      },
    };
  }
  if (type === "building") {
    const all = db
      .select()
      .from(data_set_detail_buildings)
      .where(eq(data_set_detail_buildings.data_set_result_id, resultId))
      .all();

    // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
    const percentage = DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].percentage;

    return {
      data: all.map((row: SelectDataSetDetailBuilding) => {
        return {
          x: row[x] as string,
          // TODO: この辺りの型定義は別途修正が必要
          y: formatChartValue(row[y] ?? "", percentage) as number,
        };
      }),
      xAxisColumn: {
        type: "string",
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[x].unit,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[x].label,
      },
      yAxisColumn: {
        type: "number",
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].unit,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[y].label,
      },
    };
  }

  return {
    data: [],
    xAxisColumn: {
      type: "string",
    },
    yAxisColumn: {
      type: "number",
    },
  };
}) satisfies IpcMainListener;
