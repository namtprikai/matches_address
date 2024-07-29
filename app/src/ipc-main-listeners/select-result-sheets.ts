import { sql } from "drizzle-orm";
import { type IpcMainListener } from ".";
import { result_sheets } from "@/schema";
import { db } from "@/utils/db";

type ResultSheet = typeof result_sheets.$inferSelect;

export const selectResultSheets: IpcMainListener = (_: unknown, {workbookId}: {workbookId: number}): ResultSheet[] => {
  const all = db.select().from(result_sheets).where(sql`${result_sheets.workbook_id} = ${workbookId}`).all();

  return all;
}