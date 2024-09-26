import { and, eq, gte, lte, or } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { columnsToSelectField } from "../utils/columns-to-select-field";
import { type FilterCondition, type TableProps } from "../@types/charts";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";
import { FilterQuery } from "../utils/filter-query";
import { formatTableValue } from "../utils/format-table-value";
import { getColumnMetadata } from "../utils/get-column-metadata";
import { type IpcMainListener } from ".";

type FilterDataSetForTableResponse = TableProps;
export type FilterDataSetForTableArgs = {
  resultId: number;
  filterByYear: {
    startValue: string | undefined;
    endValue: string | undefined;
  };
  filterByAreas?: string[];
  filterConditions: FilterCondition[];
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
    filterByAreas,
    limit,
    offset,
    filterConditions,
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
          ...FilterQuery({ conditions: filterConditions ?? [] }),
          or(
            // 地域区分文字列のリストからeq条件を作成
            ...(filterByAreas ?? []).map((area) =>
              eq(data_set_detail_buildings.area_group, area),
            ),
          ),
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
          const metadata = getColumnMetadata({
            key,
            unit: type,
          });
          return {
            ...acc,
            [key]: formatTableValue(value, metadata),
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
          ...FilterQuery({ conditions: filterConditions ?? [] }),
          or(
            // 地域区分文字列のリストからeq条件を作成
            ...(filterByAreas ?? []).map((area) =>
              eq(data_set_detail_areas.area_group, area),
            ),
          ),
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
          const metadata = getColumnMetadata({
            key,
            unit: type,
          });

          return {
            ...acc,
            [key]: formatTableValue(value, metadata),
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
