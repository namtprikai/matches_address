import { and, eq, gte, lte, or } from "drizzle-orm";
import { db } from "../../utils/db";
import { type BarView } from "../interfaces/view";
import { data_set_detail_areas } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { filterQueryBuilder } from "./filter-query-builder";

/** @todo */
type ReturnType = unknown;

const fetchAreaBarChartData = (view: BarView): ReturnType => {
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

  // データ取得
  const filterSubQuery = db
    .select()
    .from(data_set_detail_areas)
    .where(
      and(
        eq(data_set_detail_areas.data_set_result_id, dataSetResultId),
        yearFilter?.value.start
          ? gte(
              data_set_detail_areas.reference_date,
              `${yearFilter?.value.start}-01-01`,
            )
          : undefined,
        yearFilter?.value.end
          ? lte(
              data_set_detail_areas.reference_date,
              `${yearFilter?.value.end}-12-31`,
            )
          : undefined,
        ...filterQueryBuilder({
          conditions: filterConditions ?? [],
        }),
        or(
          // 地域区分文字列のリストからeq条件を作成
          ...(areaFilter?.value ?? []).map((area) =>
            eq(data_set_detail_areas.area_group, area),
          ),
        ),
      ),
    )
    .as("filterSubQuery");

  return;
};

fetchAreaBarChartData({
  dataSetResultId: 1,
  unit: "area",
  style: "bar",
  title: "建物別売上",
  parameters: [],
});
