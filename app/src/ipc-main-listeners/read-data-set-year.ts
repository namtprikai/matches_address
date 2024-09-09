import { sql } from "drizzle-orm";
import { data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { formatDate } from "../utils/format-date";
import { type IpcMainListener } from ".";

/**
 * DataSetに含まれるreference_dateから、年数を読み取る
 */
export const readDataSetYear = (async (
  _: unknown,
  { dataSetResultId }: { dataSetResultId: number },
): Promise<string[]> => {
  const building = db
    .select()
    .from(data_set_detail_buildings)
    .where(
      sql`${data_set_detail_buildings.data_set_result_id} = ${dataSetResultId}`,
    )
    .all();

  const years = building.map((item) => {
    return formatDate(item.reference_date, "YYYY");
  });

  // 重複を削除
  const reducedYears = Array.from(new Set(years));

  return reducedYears;
}) satisfies IpcMainListener;
