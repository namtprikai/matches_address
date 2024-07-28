import { type IpcMainListener } from ".";
import { result_sheets } from "@/schema";
import { db } from "@/utils/db";

export const insertResultSheets: IpcMainListener = (
  _: unknown,
  { workbook_id, title }: { workbook_id: number, title: string },
): {
  id: number | bigint;
} => {
  const res = db.insert(result_sheets).values({ workbook_id, title }).returning().run();
  return {
    id: res.lastInsertRowid
  }
};
