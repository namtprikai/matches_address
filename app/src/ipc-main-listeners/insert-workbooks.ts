import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

export const insertWorkbooks: IpcMainListener = (
  _: unknown,
  { title }: { title: string },
): {
  id: number | bigint;
} => {
  const res = db.insert(workbooks).values({ title }).returning().run();
  return {
    id: res.lastInsertRowid
  }
};
