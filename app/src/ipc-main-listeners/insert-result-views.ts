import { result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type InsertResultViews = typeof result_views.$inferInsert;
type SelectResultViews = typeof result_views.$inferSelect;

export const insertResultViews = (async (
  _: unknown,
  { sheet_id, data_set_result_id }: InsertResultViews,
): Promise<SelectResultViews[]> => {
  const res = await db
    .insert(result_views)
    .values({ sheet_id, data_set_result_id, title: "" })
    .returning()
  return res;
}) satisfies IpcMainListener;
