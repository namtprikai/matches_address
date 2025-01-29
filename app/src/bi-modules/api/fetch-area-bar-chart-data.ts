import { and, eq, gte, lte, or } from "drizzle-orm";
import { db } from "../../utils/db";
import { type BarView } from "../interfaces/view";
import { data_set_detail_areas } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { filterQueryBuilder } from "./filter-query-builder";

/** @todo */
type ReturnType = unknown;

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

  // データ取得
  let query = db.select().from(data_set_detail_areas).$dynamic();
  query = query.where(eq(data_set_detail_areas.data_set_result_id, 3));

  /** @todo 以下の条件式が悪さしてそう。 data_set_result_id=1で検索する結果は5075件のはずだが、なぜか全体数の5076件が返ってきているように見える*/

  /** 年のフィルタ */
  if (yearFilter?.value.start) {
    query = query.where(
      gte(
        data_set_detail_areas.reference_date,
        `${yearFilter.value.start}-01-01`,
      ),
    );
  }
  if (yearFilter?.value.end) {
    query = query.where(
      lte(
        data_set_detail_areas.reference_date,
        `${yearFilter.value.end}-12-31`,
      ),
    );
  }

  /** 地域のフィルタ */
  if (areaFilter?.value) {
    query = query.where(
      or(
        ...(areaFilter.value ?? []).map((area) =>
          eq(data_set_detail_areas.area_group, area),
        ),
      ),
    );
  }

  /** フィルタ詳細条件のフィルタ */
  if (filterConditions) {
    query = query.where(
      and(...filterQueryBuilder({ conditions: filterConditions })),
    );
  }

  // .where(
  //   and(
  //     eq(data_set_detail_areas.data_set_result_id, dataSetResultId),
  //     yearFilter?.value.start
  //       ? gte(
  //           data_set_detail_areas.reference_date,
  //           `${yearFilter?.value.start}-01-01`,
  //         )
  //       : undefined,
  //     yearFilter?.value.end
  //       ? lte(
  //           data_set_detail_areas.reference_date,
  //           `${yearFilter?.value.end}-12-31`,
  //         )
  //       : undefined,
  //     ...filterQueryBuilder({
  //       conditions: filterConditions ?? [],
  //     }),
  //     or(
  //       // 地域区分文字列のリストからeq条件を作成
  //       ...(areaFilter?.value ?? []).map((area) =>
  //         eq(data_set_detail_areas.area_group, area),
  //       ),
  //     ),
  //   ),
  // )
  // .as("filterSubQuery");

  const result = await query;

  return result;
};
