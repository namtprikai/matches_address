import {
  type InsertResultSheet,
  result_sheets,
  type SelectResultSheet,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const insertResultSheets = (async (
  _: unknown,
  { workbook_id, title }: InsertResultSheet,
): Promise<SelectResultSheet[]> => {
  const res = await db
    .insert(result_sheets)
    .values({ workbook_id, title })
    .returning();
  return res;
}) satisfies IpcMainListener;
