import { sql } from "drizzle-orm";
import { result_sheets } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type InsertResultSheets = typeof result_sheets.$inferInsert;
type SelectResultSheets = typeof result_sheets.$inferSelect;

export const updateResultSheets = (async (
  _: unknown,
  {
    resultSheetId,
    value: { title },
  }: { resultSheetId: number; value: InsertResultSheets },
): Promise<SelectResultSheets[]> => {
  const res = await db
    .update(result_sheets)
    .set({ title })
    .where(sql`${result_sheets.id} = ${resultSheetId}`)
    .returning();

  return res;
}) satisfies IpcMainListener;
