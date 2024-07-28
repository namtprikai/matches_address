import { type IpcMainListener } from ".";
import { data_set_results } from "@/schema";
import { db } from "@/utils/db";

type DataSetResult = typeof data_set_results.$inferSelect;

export const selectDataSetResults: IpcMainListener = (): DataSetResult[] => {
  const all = db.select().from(data_set_results).all();

  return all;
};
