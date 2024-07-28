import { type IpcMainListener } from ".";
import { result_sheets } from "@/schema";
import { db } from "@/utils/db";

type InsertResultSheets = typeof result_sheets.$inferInsert;

export const insertResultSheets: IpcMainListener = (
  _: unknown,
  { workbook_id, title }: InsertResultSheets,
): {
  id: number | bigint;
} => {
  const res = db
    .insert(result_sheets)
    .values({ workbook_id, title })
    .returning()
    .run();
  return {
    id: res.lastInsertRowid,
  };
};
