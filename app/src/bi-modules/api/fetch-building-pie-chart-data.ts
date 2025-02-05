import { and, eq, type SQL } from "drizzle-orm";
import { db } from "../../utils/db";
import { type PieView } from "../interfaces/view";
import { data_set_detail_buildings } from "../../schema";
import { type FilterCondition } from "../interfaces/parameter";
import { type ChartProps } from "../../@types/charts";

type Params = {
  view: PieView;
  pagination: {
    limit: number;
    offset: number;
  };
};

export const fetchBuildingPieChartData = async ({
  view,
  pagination: { limit, offset },
}: Params): Promise<ChartProps> => {
  if (view.style !== "pie") {
    throw new Error(
      'このAPIは円グラフ(style: "pie")のデータのみ対応しています',
    );
  }
  if (view.unit !== "building") {
    throw new Error(
      'このAPIは建物単位(unit: "building")のデータのみ対応しています',
    );
  }

  /** 項目のラベル情報 */
  const COLUMNS = {
    xAxisColumn: {
      type: "string",
      unit: "",
      label: "",
    },
    yAxisColumn: {
      type: "number",
      unit: "",
      label: "",
    },
  } as const;

  const { dataSetResultId } = view;

  // パラメータの型安全な抽出
  const value = view.parameters.find((p) => p.key === "value");
  const label = view.parameters.find((p) => p.key === "label");
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

  // クエリのベース作成
  let query = db.select().from(data_set_detail_buildings).$dynamic();

  const queryWheres: (SQL<unknown> | undefined)[] = [
    eq(data_set_detail_buildings.data_set_result_id, dataSetResultId),
  ];

  query = query.where(and(...queryWheres));

  const baseQuery = query.as("baseQuery");

  const result = db.select().from(baseQuery).limit(limit).offset(offset).all();

  return {
    data: [
      {
        x: "a",
        y: 1,
      },
    ],
    ...COLUMNS,
  };
};
