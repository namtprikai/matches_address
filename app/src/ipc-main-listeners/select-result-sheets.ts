import { sql } from "drizzle-orm";
import { result_sheets, type SelectResultSheet } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectResultSheets = ((
  _: unknown,
  { workbookId }: { workbookId: number },
): SelectResultSheet[] => {
  const all = db
    .select()
    .from(result_sheets)
    .where(sql`${result_sheets.workbook_id} = ${workbookId}`)
    .all();

  return all;
}) satisfies IpcMainListener;
