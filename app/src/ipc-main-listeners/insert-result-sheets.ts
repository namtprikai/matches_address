import { result_sheets } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type InsertResultSheets = typeof result_sheets.$inferInsert;
type SelectResultSheets = typeof result_sheets.$inferSelect;

export const insertResultSheets = (async(
  _: unknown,
  { workbook_id, title }: InsertResultSheets,
): Promise<SelectResultSheets[]> => {
  const res = await db
    .insert(result_sheets)
    .values({ workbook_id, title })
    .returning()
  return res;
}) satisfies IpcMainListener;
