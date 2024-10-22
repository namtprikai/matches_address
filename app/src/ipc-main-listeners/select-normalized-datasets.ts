import { normalized_data_sets, type SelectNormalizedDataSet } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectNormalizedDataSets = (async (
  _: unknown,
): Promise<SelectNormalizedDataSet[]> => {
  const data = await db.select().from(normalized_data_sets);
  return data;
}) satisfies IpcMainListener;
