import { and, eq, gte, lte } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { columnsToSelectField } from "../utils/columns-to-select-field";
import { type TableProps } from "../@types/charts";
import { formatChartValue } from "../utils/format-chart-value";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";
import { type IpcMainListener } from ".";

type FilterDataSetForTableResponse = TableProps;
export type FilterDataSetForTableArgs = {
  resultId: number;
  filterByYear: {
    startValue: string | undefined;
    endValue: string | undefined;
  };
  limit: number;
  offset: number;
} & (
  | { type: "building"; columns: BUILDING_DATASET_COLUMN[] }
  | {
      type: "area";
      columns: AREA_DATASET_COLUMN[];
    }
);

export const filterDataSetForTable = (async (
  _: unknown,
  {
    resultId,
    type,
    columns,
    filterByYear,
    limit,
    offset,
  }: FilterDataSetForTableArgs,
): Promise<FilterDataSetForTableResponse> => {
  if (type === "building") {
    const all = await db
      .select(columnsToSelectField({ type: "building", columns }))
      .from(data_set_detail_buildings)
      .where(
        and(
          eq(data_set_detail_buildings.data_set_result_id, resultId),
          filterByYear.startValue
            ? gte(
                data_set_detail_buildings.reference_date,
                `${filterByYear.startValue}-01-01`,
              )
            : undefined,
          filterByYear.endValue
            ? lte(
                data_set_detail_buildings.reference_date,
                `${filterByYear.endValue}-12-31`,
              )
            : undefined,
        ),
      )
      .limit(limit)
      .offset(offset)
      .all();

    return {
      columns: columns.map((column) => {
        const columnMetadata = BUILDING_DATASET_COLUMN_METADATA[column];
        return {
          key: column,
          label: columnMetadata.label,
          unit: columnMetadata.unit,
        };
      }),
      data: all.map((row) => {
        const rowArray = Object.entries(row);
        const formattedRow = rowArray.reduce((acc, [key, value]) => {
          return {
            ...acc,
            [key]: formatChartValue(value ?? 0),
          };
        }, {});

        return formattedRow;
      }),
    };
  }

  if (type === "area") {
    const all = db
      .select(columnsToSelectField({ type: "area", columns }))
      .from(data_set_detail_areas)
      .where(
        and(
          eq(data_set_detail_areas.data_set_result_id, resultId),
          filterByYear.startValue
            ? gte(
                data_set_detail_areas.reference_date,
                `${filterByYear.startValue}-01-01`,
              )
            : undefined,
          filterByYear.endValue
            ? lte(
                data_set_detail_areas.reference_date,
                `${filterByYear.endValue}-12-31`,
              )
            : undefined,
        ),
      )
      .limit(limit)
      .offset(offset)
      .all();

    return {
      columns: columns.map((column) => {
        const columnMetadata = AREA_DATASET_COLUMN_METADATA[column];
        return {
          key: column,
          label: columnMetadata.label,
          unit: columnMetadata.unit,
        };
      }),
      data: all.map((row) => {
        const rowArray = Object.entries(row);
        const formattedRow = rowArray.reduce((acc, [key, value]) => {
          return {
            ...acc,
            [key]: formatChartValue(value ?? 0),
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
