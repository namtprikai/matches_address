import { eq, sql } from "drizzle-orm";
import { data_set_results, result_views } from "../schema";
import { db } from "../utils/db";
import { type SelectResultViewResponse } from "./select-result-view";
import { type IpcMainListener } from ".";

type DataSetResults = typeof data_set_results.$inferSelect;
// Left Join のため、 data_set_results が null の場合がある
type Result = {
  result_views: SelectResultViewResponse;
  data_set_results: DataSetResults | null;
}

export const selectResultViews = ((
  _: unknown,
  { sheetId }: { sheetId: number },
): Result[] => {
  const all = db
    .select()
    .from(result_views)
    .where(sql`${result_views.sheet_id} = ${sheetId}`)
    // 同時にdata_set_resultsも取得する
    .leftJoin(data_set_results, eq(result_views.data_set_result_id, data_set_results.id))
    .all();

  return all as Result[];
}) satisfies IpcMainListener;
