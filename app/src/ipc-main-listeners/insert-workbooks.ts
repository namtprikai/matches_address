import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

type InsertWorkbook = typeof workbooks.$inferInsert;

export const insertWorkbooks: IpcMainListener = (
  _: unknown,
  { title }: InsertWorkbook,
): {
  id: number | bigint;
} => {
  const res = db.insert(workbooks).values({ title }).returning().run();
  return {
    id: res.lastInsertRowid,
  };
};
