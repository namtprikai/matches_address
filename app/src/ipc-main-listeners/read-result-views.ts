import { eq, sql } from "drizzle-orm";
import {
  result_views,
  data_set_results,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;
export type ReadResultViewsResponse = {
  result_views: ResultViews;
  data_set_results: DataSetResults;
}[];

export const readResultViews = ((
  _: unknown,
  { sheetId }: { sheetId: number },
): ReadResultViewsResponse => {
  const all = db
    .select()
    .from(result_views)
    .where(sql`${result_views.sheet_id} = ${sheetId}`)
    .innerJoin(
      data_set_results,
      eq(data_set_results.id, result_views.data_set_result_id),
    )
    .all();

  return all;
}) satisfies IpcMainListener;
