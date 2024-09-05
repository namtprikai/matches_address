import {
  type InsertResultView,
  result_views,
  type SelectResultView,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const insertResultViews = (async (
  _: unknown,
  { sheet_id, data_set_result_id }: InsertResultView,
): Promise<SelectResultView[]> => {
  const res = await db
    .insert(result_views)
    .values({ sheet_id, data_set_result_id, title: "" })
    .returning();
  return res;
}) satisfies IpcMainListener;
