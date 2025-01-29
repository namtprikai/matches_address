import { and, eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { type BarView } from "../interfaces/view";
import { data_set_detail_buildings } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";

/** @todo */
type ReturnType = unknown;

const fetchBuildingBarChartData = (view: BarView): ReturnType => {
  if (view.style !== "bar") {
    throw new Error(
      'このAPIは棒グラフ(style: "bar")のデータのみ対応しています',
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

  // 必須パラメータの検証
  if (!dataSetResultId) {
    throw new Error("dataSetResultIdは必須です");
  }
  if (!xAxis || !yAxis) {
    throw new Error("X軸とY軸の設定は必須です");
  }

  // データ取得
  db.select()
    .from(data_set_detail_buildings)
    .where(
      and(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId)),
    );

  return;
};
