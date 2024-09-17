import { data_set_results, type SelectDataSetResult } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectDataSetResults = (async (): Promise<
  SelectDataSetResult[]
> => {
  const all = await db.select().from(data_set_results).all();

  return all;
}) satisfies IpcMainListener;
