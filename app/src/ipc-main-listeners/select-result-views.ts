import { eq } from "drizzle-orm";
import {
  data_set_results,
  result_views,
  type SelectDataSetResult,
} from "../schema";
import { db } from "../utils/db";
import { type SelectResultViewResponse } from "./select-result-view";
import { type IpcMainListener } from ".";

// Left Join のため、 data_set_results が null の場合がある
export type CustomSelectResultViews = {
  result_views: SelectResultViewResponse;
  data_set_results: SelectDataSetResult | null;
};

export const selectResultViews = (async (
  _: unknown,
  { sheetId }: { sheetId: number },
): Promise<CustomSelectResultViews[]> => {
  const all = await db
    .select()
    .from(result_views)
    .where(eq(result_views.sheet_id, sheetId))
    // 同時にdata_set_resultsも取得する
    .leftJoin(
      data_set_results,
      eq(result_views.data_set_result_id, data_set_results.id),
    )
    .all();

  return all as CustomSelectResultViews[];
}) satisfies IpcMainListener;
