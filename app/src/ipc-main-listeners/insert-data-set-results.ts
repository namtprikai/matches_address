import { type IpcMainListener } from ".";
import { data_set_results } from "@/schema";
import { db } from "@/utils/db";

type InsertDataSetResult = typeof data_set_results.$inferInsert;

export const insertDataSetResults: IpcMainListener = (
  _: unknown,
  { title }: InsertDataSetResult,
): {
  id: number | bigint;
} => {
  const res = db.insert(data_set_results).values({ title }).returning().run();
  return {
    id: res.lastInsertRowid,
  };
};
