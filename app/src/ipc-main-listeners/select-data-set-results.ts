import { eq } from "drizzle-orm";
import { data_set_results, type SelectDataSetResult } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectDataSetResults = (async (
  _: unknown,
  dataSetResultId?: number,
): Promise<SelectDataSetResult[]> => {
  if (dataSetResultId) {
    return await db
      .select()
      .from(data_set_results)
      .where(eq(data_set_results.id, dataSetResultId));
  }
  const all = await db.select().from(data_set_results).all();

  return all;
}) satisfies IpcMainListener;
