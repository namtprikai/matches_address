import { sql } from "drizzle-orm";
import { result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type InsertResultViews = typeof result_views.$inferInsert;
type SelectResultViews = typeof result_views.$inferSelect;

export const updateResultViews = (async (
  _: unknown,
  {
    resultViewId,
    value: { title, style, unit },
  }: { resultViewId: number; value: InsertResultViews },
): Promise<SelectResultViews[]> => {
  const res = await db
    .update(result_views)
    .set({ title, style, unit })
    .where(sql`${result_views.id} = ${resultViewId}`)
    .returning();
  return res;
}) satisfies IpcMainListener;
