import { data_set_results } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type DataSetResult = typeof data_set_results.$inferSelect;

export const selectDataSetResults = ((): DataSetResult[] => {
  const all = db.select().from(data_set_results).all();

  return all;
}) satisfies IpcMainListener;
