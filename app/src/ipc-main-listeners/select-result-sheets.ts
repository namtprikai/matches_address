import { sql } from "drizzle-orm";
import { type IpcMainListener } from ".";
import { result_sheets } from "@/schema";
import { db } from "@/utils/db";

export const selectResultSheets: IpcMainListener = (_: unknown, {workbookId}: {workbookId: number}): {
  id: number;
  workbook_id: number | null;
  title: string | null;
  created_at: string | null;
}[] => {
  const all = db.select().from(result_sheets).where(sql`${result_sheets.workbook_id} = ${workbookId}`).all();

  return all;
}