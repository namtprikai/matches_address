import { eq } from "drizzle-orm";
import {
  data_set_detail_buildings,
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import {
  DATA_SET_DETAIL_AREA_COLUMN_CONFIG,
  DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG,
} from "../config/data-columns";
import { columnsToSelectField } from "../utils/columns-to-select-field";
import { type TableProps } from "../@types/charts";
import { formatChartValue } from "../utils/format-chart-value";
import { type IpcMainListener } from ".";

type FilterDataSetForTableResponse = TableProps;

export const filterDataSetForTable = ((
  _: unknown,
  {
    resultId,
    type,
    columns,
  }: { resultId: number } & (
    | { type: "building"; columns: (keyof SelectDataSetDetailBuilding)[] }
    | {
        type: "area";
        columns: (keyof SelectDataSetDetailArea)[];
      }
  ),
): FilterDataSetForTableResponse => {
  if (type === "building") {
    const all = db
      .select(columnsToSelectField({ type: "building", columns }))
      .from(data_set_detail_buildings)
      .where(eq(data_set_detail_buildings.data_set_result_id, resultId))
      .all();

    return {
      columns: columns.map((column) => ({
        key: column,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].label,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].unit,
      })),
      data: all.map((row) => {
        const rowArray = Object.entries(row);
        const formattedRow = rowArray.reduce((acc, [key, value]) => {
          return {
            ...acc,
            [key]: formatChartValue(
              value,
              // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
              DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[key].percentage,
              2,
            ),
          };
        }, {});

        return formattedRow;
      }),
    };
  }

  if (type === "area") {
    const all = db
      .select(columnsToSelectField({ type: "area", columns }))
      .from(data_set_detail_buildings)
      .where(eq(data_set_detail_buildings.data_set_result_id, resultId))
      .all();

    return {
      columns: columns.map((column) => ({
        key: column,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        label: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].label,
        // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
        unit: DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].unit,
      })),
      data: all.map((row) => {
        const rowArray = Object.entries(row);
        const formattedRow = rowArray.reduce((acc, [key, value]) => {
          return {
            ...acc,
            [key]: formatChartValue(
              value,
              // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
              DATA_SET_DETAIL_AREA_COLUMN_CONFIG[key].percentage,
              2,
            ),
          };
        }, {});

        return formattedRow;
      }),
    };
  }

  return {
    columns: [],
    data: [],
  };
}) satisfies IpcMainListener;
