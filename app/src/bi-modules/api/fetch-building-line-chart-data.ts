import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  ne,
  or,
  type SQL,
  sql,
  isNull,
} from "drizzle-orm";
import { db } from "../../utils/db";
import { type LineView } from "../interfaces/view";
import { data_set_detail_buildings, isBuildingColumn } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { type ChartProps } from "../../@types/charts";
import {
  type BUILDING_DATASET_COLUMN,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { filterQueryBuilder } from "./builder/filter-query-builder";
import { conditionsToCaseQueryBuilder } from "./builder/conditions-to-case-query-builder";

type Params = {
  view: LineView;
};

export const fetchBuildingLineChartData = async ({
  view,
}: Params): Promise<ChartProps> => {
  const { orderBy } = view;
  if (view.style !== "line") {
    throw new Error(
      'このAPIは棒グラフ(style: "line")のデータのみ対応しています',
    );
  }
  if (view.unit !== "building") {
    throw new Error(
      'このAPIは建物単位(unit: "building")のデータのみ対応しています',
    );
  }

  const { dataSetResultId } = view;

  // パラメータの型安全な抽出
  const xAxis = view.parameters.find((p) => p.key === "xAxis");
  const yAxis = view.parameters.find((p) => p.key === "yAxis");
  const yearFilter = view.parameters.find((p) => p.key === "year");
  const areaFilter = view.parameters.find((p) => p.key === "area");
  const groupConditions = view.parameters.filter((p) => p.type === "group");
  const filterConditions = view.parameters.filter(
    (p): p is FilterCondition /** startsWithが型推論しないため */ =>
      p.key.startsWith("filter_"),
  );
  const groupAggregation = view.parameters.find(
    (p) => p.type === "group_aggregation",
  );

  // 必須パラメータの検証
  if (!dataSetResultId) {
    throw new Error("dataSetResultIdは必須です");
  }
  if (!xAxis || !yAxis) {
    throw new Error("X軸とY軸の設定は必須です");
  }

  /** 項目のラベル情報 */
  const COLUMNS = {
    xAxisColumn: {
      type: "string",
      unit: BUILDING_DATASET_COLUMN_METADATA[
        xAxis.value as BUILDING_DATASET_COLUMN
      ].unit,
      label:
        BUILDING_DATASET_COLUMN_METADATA[xAxis.value as BUILDING_DATASET_COLUMN]
          .label,
    },
    yAxisColumn: {
      type: "number",
      unit: BUILDING_DATASET_COLUMN_METADATA[
        yAxis.value as BUILDING_DATASET_COLUMN
      ].unit,
      label:
        BUILDING_DATASET_COLUMN_METADATA[yAxis.value as BUILDING_DATASET_COLUMN]
          .label,
    },
  } as const;

  if (!orderBy || !orderBy.column) {
    throw new Error("orderByは必須です");
  }

  // クエリのベース作成
  let query = db
    .select({
      /** data_set_detail_buildingsのColumn名とそれぞれのvalueに定義された値が一致していることが前提でrawを利用 */
      [xAxis.value]: sql.raw(`${xAxis.value}`).as(xAxis.value),
      [yAxis.value]: sql.raw(`${yAxis.value}`).as(yAxis.value),
      [orderBy.column]: data_set_detail_buildings[orderBy.column],
    })
    .from(data_set_detail_buildings)
    .$dynamic();

  const queryWheres: (SQL<unknown> | undefined)[] = [
    eq(data_set_detail_buildings.data_set_result_id, dataSetResultId),
    // 推定不可データを除外（outlier_flag, single_story_row_house_flag, matched_data_flagがすべて0または null）
    and(
      or(
        eq(data_set_detail_buildings.outlier_flag, 0),
        isNull(data_set_detail_buildings.outlier_flag),
      ),
      or(
        eq(data_set_detail_buildings.single_story_row_house_flag, 0),
        isNull(data_set_detail_buildings.single_story_row_house_flag),
      ),
      or(
        eq(data_set_detail_buildings.matched_data_flag, 0),
        isNull(data_set_detail_buildings.matched_data_flag),
      ),
    ),
  ];

  const allQuery = query
    .where(
      and(
        eq(data_set_detail_buildings.data_set_result_id, dataSetResultId),
        and(
          or(
            eq(data_set_detail_buildings.outlier_flag, 0),
            isNull(data_set_detail_buildings.outlier_flag),
          ),
          or(
            eq(data_set_detail_buildings.single_story_row_house_flag, 0),
            isNull(data_set_detail_buildings.single_story_row_house_flag),
          ),
          or(
            eq(data_set_detail_buildings.matched_data_flag, 0),
            isNull(data_set_detail_buildings.matched_data_flag),
          ),
        ),
      ),
    )
    .as("allQuery");
  const allCount = await db.select({ count: count() }).from(allQuery);

  /** 年のフィルタ */
  if (yearFilter?.value.start) {
    queryWheres.push(
      gte(
        data_set_detail_buildings.reference_date,
        `${yearFilter.value.start}-01-01`,
      ),
    );
  }
  if (yearFilter?.value.end) {
    queryWheres.push(
      lte(
        data_set_detail_buildings.reference_date,
        `${yearFilter.value.end}-12-31`,
      ),
    );
  }

  /** 地域のフィルタ */
  if (areaFilter?.value) {
    queryWheres.push(
      or(
        ...(areaFilter.value ?? []).map((area) =>
          eq(data_set_detail_buildings.area_group, area),
        ),
      ),
    );
  }

  /** フィルタ詳細条件のフィルタ */
  if (filterConditions) {
    queryWheres.push(
      and(...filterQueryBuilder({ conditions: filterConditions })),
    );
  }

  query = query.where(and(...queryWheres));

  const baseQuery = query.as("baseQuery");

  if (groupConditions.length > 0) {
    const GroupLabel = `group` as const;
    const caseQuery = conditionsToCaseQueryBuilder(
      xAxis.value,
      groupConditions,
    );

    const groupQuery = db
      .select({
        [xAxis.value]: baseQuery[xAxis.value],
        [yAxis.value]: baseQuery[yAxis.value],
        [GroupLabel]: caseQuery.as("caseQuery"),
      })
      .from(baseQuery)
      .as("GroupLabel");

    const orderByConditions = (() => {
      if (!orderBy) {
        return asc(groupQuery.reference_date);
      }

      if (isBuildingColumn(orderBy.column)) {
        return orderBy.direction === "ascending"
          ? asc(groupQuery[orderBy.column])
          : desc(groupQuery[orderBy.column]);
      }

      return asc(groupQuery.reference_date);
    })();

    const result = db
      .select({
        x: groupQuery[GroupLabel],
        y: sql.raw(
          `${groupAggregation?.value || "avg"}(${yAxis.value}) as ${yAxis.value}`,
        ),
        [GroupLabel]: groupQuery[GroupLabel],
      })
      .from(groupQuery)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- @fixme 解決できないため
      // @ts-ignore
      .groupBy(groupQuery[GroupLabel])
      .having(ne(groupQuery[GroupLabel], sql.raw("''")))
      .orderBy(orderByConditions)
      .all();

    const totalCount = await db.select({ count: count() }).from(baseQuery);

    return {
      data: result.map((item) => ({
        x: item.x as string /** @todo */,
        y: item.y as number /** @todo */,
      })),
      totalCount: totalCount[0].count,
      allCount: allCount[0].count,
      ...COLUMNS,
    };
  }

  const orderByConditions = (() => {
    if (!orderBy) {
      return asc(baseQuery.reference_date);
    }

    if (isBuildingColumn(orderBy.column)) {
      return orderBy.direction === "ascending"
        ? asc(baseQuery[orderBy.column])
        : desc(baseQuery[orderBy.column]);
    }

    return asc(baseQuery.reference_date);
  })();

  const result = db
    .select({
      x: baseQuery[xAxis.value],
      y: baseQuery[yAxis.value],
    })
    .from(baseQuery)
    .orderBy(orderByConditions)
    .all();

  const totalCount = await db.select({ count: count() }).from(baseQuery);

  return {
    data: result.map((item) => ({
      x: item.x as string /** @todo */,
      y: item.y as number /** @todo */,
    })),
    totalCount: totalCount[0].count,
    allCount: allCount[0].count,
    ...COLUMNS,
  };
};
