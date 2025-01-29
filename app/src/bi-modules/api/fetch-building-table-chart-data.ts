import { and, eq } from "drizzle-orm";
import { type TableView } from "../interfaces/view";
import { data_set_detail_buildings } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { db } from "../../utils/db";

/** @todo */
type ReturnType = unknown;

const fetchBuildingTableChartData = (view: TableView): ReturnType => {
  if (view.style !== "table") {
    throw new Error('このAPIは表(style: "table")のデータのみ対応しています');
  }
  if (view.unit !== "building") {
    throw new Error(
      'このAPIは建物単位(unit: "building")のデータのみ対応しています',
    );
  }

  const { dataSetResultId } = view;

  // パラメータの型安全な抽出
  const columns = view.parameters.find((p) => p.key === "columns");
  const yearFilter = view.parameters.find((p) => p.key === "year");
  const areaFilter = view.parameters.find((p) => p.key === "area");
  const filterConditions = view.parameters.filter(
    (p): p is FilterCondition /** startsWithが型推論しないため */ =>
      p.key.startsWith("filter_"),
  );

  // 必須パラメータの検証
  if (!dataSetResultId) {
    throw new Error("dataSetResultIdは必須です");
  }

  // データ取得
  db.select()
    .from(data_set_detail_buildings)
    .where(
      and(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId)),
    );

  return;
};
