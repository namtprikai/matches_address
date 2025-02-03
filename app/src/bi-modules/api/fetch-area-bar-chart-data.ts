import { and, count, eq, gte, like, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../utils/db";
import { type BarView } from "../interfaces/view";
import { data_set_detail_areas } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { filterQueryBuilder } from "./filter-query-builder";
import { conditionsToCaseQuery } from "./conditions-to-case-query";

/** @todo */
type ReturnType = unknown;

/**
 * クエリまたはAPIでやるべきこと
 * 1. 年・地域・フィルター詳細条件を適用した全件結果を取得
 * 2. グループ条件がある場合は、グループ名と集計値をマップしたデータを取得
 */

export const fetchAreaBarChartData = async (
  view: BarView,
): Promise<ReturnType> => {
  if (view.style !== "bar") {
    throw new Error(
      'このAPIは棒グラフ(style: "bar")のデータのみ対応しています',
    );
  }
  if (view.unit !== "area") {
    throw new Error(
      'このAPIは地域単位(unit: "area")のデータのみ対応しています',
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

  // 必須パラメータの検証
  if (!dataSetResultId) {
    throw new Error("dataSetResultIdは必須です");
  }
  if (!xAxis || !yAxis) {
    throw new Error("X軸とY軸の設定は必須です");
  }

  // クエリのベース作成
  const query = db
    .select({
      /** data_set_detail_areasのColumn名とそれぞれのvalueに定義された値が一致していることが前提でrawを利用 */
      [xAxis.value]: sql.raw(`${xAxis.value}`),
      [yAxis.value]: sql.raw(`${yAxis.value}`),
    })
    .from(data_set_detail_areas)
    .$dynamic();

  const queryWheres: (SQL<unknown> | undefined)[] = [
    eq(data_set_detail_areas.data_set_result_id, dataSetResultId),
  ];

  /** 年のフィルタ */
  if (yearFilter?.value.start) {
    queryWheres.push(
      gte(
        data_set_detail_areas.reference_date,
        `${yearFilter.value.start}-01-01`,
      ),
    );
  }
  if (yearFilter?.value.end) {
    queryWheres.push(
      lte(
        data_set_detail_areas.reference_date,
        `${yearFilter.value.end}-12-31`,
      ),
    );
  }

  /** 地域のフィルタ */
  if (areaFilter?.value) {
    queryWheres.push(
      or(
        ...(areaFilter.value ?? []).map((area) =>
          eq(data_set_detail_areas.area_group, area),
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

  /** 重複を排除する */
  query
    .groupBy(sql.raw(`${xAxis.value}`))
    .having(sql.raw(`${xAxis.value} <> ''`));

  const baseQuery = query.as("baseQuery");

  if (groupConditions.length > 0) {
    const GroupLabel = `${xAxis.value}_group` as const;
    const caseQuery = conditionsToCaseQuery(xAxis.value, groupConditions);
    const groupQuery = db
      .select({
        [GroupLabel]: sql.join(
          [caseQuery, sql.raw(`as ${GroupLabel}`)],
          sql.raw(" "),
        ),
      })
      .from(baseQuery);

    const result = db.select().from(groupQuery.as("groupQuery")).all();
    return result;
  }

  const result = db.select().from(baseQuery).all();

  return result;
};
