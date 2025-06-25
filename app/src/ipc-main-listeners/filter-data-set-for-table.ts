import { and, count, eq, gte, lte, or } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { columnsToSelectField } from "../utils/columns-to-select-field";
import { type TableProps } from "../@types/charts";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";

import { formatTableValue } from "../utils/format-table-value";
import { getColumnMetadata } from "../utils/get-column-metadata";
import {
  type MapWithTableView,
  type TableView,
} from "../bi-modules/interfaces/view";
import {
  type YearFilter,
  type FilterCondition,
  type AreaFilter,
} from "../bi-modules/interfaces/parameter";
import { filterQueryBuilder } from "../bi-modules/api/builder/filter-query-builder";
import { type IpcMainListener } from ".";

interface BaseProps {
  view: TableView;
  pagination: {
    limit: number;
    offset: number;
  };
}

interface UnitBuildingProps extends BaseProps {
  unit: "building";
  columns: BUILDING_DATASET_COLUMN[];
}
interface UnitAreaProps extends BaseProps {
  unit: "area";
  columns: AREA_DATASET_COLUMN[];
}

export type FilterDataSetForTableArgs = UnitBuildingProps | UnitAreaProps;

type Params = {
  view: TableView | MapWithTableView;
  pagination: {
    limit: number;
    offset: number;
  };
};

export const filterDataSetForTable = (async (
  _: unknown,
  { view, pagination: { limit, offset } }: Params,
): Promise<TableProps> => {
  const { dataSetResultId, parameters, unit } = view;
  const yearFilter = parameters.find((p) => p.key === "year");
  const areaFilter = parameters.find((p) => p.key === "area");
  const filterConditions = parameters.filter((p): p is FilterCondition =>
    p.key.startsWith("filter_"),
  );
  const columns =
    parameters.find((p) => p.key === "columns")?.value.split(",") ?? [];

  if (unit === "building") {
    const whereConditons = and(
      eq(data_set_detail_buildings.data_set_result_id, dataSetResultId),
      yearFilter?.value.start
        ? gte(
            data_set_detail_buildings.reference_date,
            `${yearFilter.value.start}-01-01`,
          )
        : undefined,
      yearFilter?.value.end
        ? lte(
            data_set_detail_buildings.reference_date,
            `${yearFilter.value.end}-12-31`,
          )
        : undefined,
      ...filterQueryBuilder({ conditions: filterConditions ?? [] }),
      or(
        // 地域区分文字列のリストからeq条件を作成
        ...(areaFilter?.value ?? []).map((area) =>
          eq(data_set_detail_buildings.area_group, area),
        ),
      ),
    );
    const all = await db
      .select({
        ...columnsToSelectField({
          type: "building",
          columns: columns as BUILDING_DATASET_COLUMN[],
        }),
        id: data_set_detail_buildings.id,
      })
      .from(data_set_detail_buildings)
      .where(whereConditons)
      .limit(limit)
      .offset(offset)
      .all();

    const totalCount = await db
      .select({ count: count() })
      .from(data_set_detail_buildings)
      .where(whereConditons);
    const allCount = await db
      .select({ count: count() })
      .from(data_set_detail_buildings)
      .where(
        and(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId)),
      );

    return {
      columns: columns.map((column) => {
        const columnMetadata =
          BUILDING_DATASET_COLUMN_METADATA[column as BUILDING_DATASET_COLUMN];
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
            unit,
          });
          return {
            ...acc,
            [key]: formatTableValue(value, metadata),
          };
        }, {});

        return formattedRow;
      }),
      totalCount: totalCount[0].count,
      allCount: allCount[0].count,
    };
  }

  if (unit === "area") {
    return byArea({
      columns: columns as AREA_DATASET_COLUMN[],
      dataSetResultId,
      yearFilter,
      areaFilter,
      filterConditions,
      pagination: {
        limit,
        offset,
      },
    });
  }

  return {
    columns: [],
    data: [],
    totalCount: 0,
    allCount: 0,
  };
}) satisfies IpcMainListener;

type ByArea = {
  columns: AREA_DATASET_COLUMN[];
  dataSetResultId: number;
  yearFilter: YearFilter | undefined;
  areaFilter: AreaFilter | undefined;
  filterConditions: FilterCondition[];
  pagination: {
    limit: number;
    offset: number;
  };
};
const byArea = async (params: ByArea): Promise<TableProps> => {
  const {
    columns,
    dataSetResultId,
    yearFilter,
    areaFilter,
    filterConditions,
    pagination: { limit, offset },
  } = params;

  const whereConditions = and(
    eq(data_set_detail_areas.data_set_result_id, dataSetResultId),
    yearFilter?.value.start
      ? gte(
          data_set_detail_buildings.reference_date,
          `${yearFilter.value.start}-01-01`,
        )
      : undefined,
    yearFilter?.value.end
      ? lte(
          data_set_detail_buildings.reference_date,
          `${yearFilter.value.end}-12-31`,
        )
      : undefined,
    ...filterQueryBuilder({ conditions: filterConditions ?? [] }),
    or(
      // 地域区分文字列のリストからeq条件を作成
      ...(areaFilter?.value ?? []).map((area) =>
        eq(data_set_detail_areas.area_group, area),
      ),
    ),
  );

  const all = db
    .select({
      ...columnsToSelectField({
        type: "area",
        columns,
      }),
      id: data_set_detail_areas.id,
    })
    .from(data_set_detail_areas)
    .where(whereConditions)
    .limit(limit)
    .offset(offset)
    .all();

  const formattedColumns = columns.map((column) => {
    const columnMetadata = AREA_DATASET_COLUMN_METADATA[column];
    return {
      key: column,
      label: columnMetadata.label,
      unit: columnMetadata.unit,
    };
  });

  const data = all.map((row) => {
    const rowArray = Object.entries(row);
    const formattedRow = rowArray.reduce((acc, [key, value]) => {
      const metadata = getColumnMetadata({
        key,
        unit: "area",
      });

      return {
        ...acc,
        [key]: formatTableValue(value, metadata),
      };
    }, {});

    return formattedRow;
  });

  const totalCount = await db
    .select({ count: count() })
    .from(data_set_detail_areas)
    .where(whereConditions);

  const allCount = await db
    .select({ count: count() })
    .from(data_set_detail_areas)
    .where(and(eq(data_set_detail_areas.data_set_result_id, dataSetResultId)));

  return {
    columns: formattedColumns,
    data,
    totalCount: totalCount[0].count,
    allCount: allCount[0].count,
  };
};
