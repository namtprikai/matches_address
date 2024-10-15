import { type InsertRawDataSet, raw_data_sets, result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const insertRawDatasets = (async (
  _: unknown,
  { file_name, file_path }: InsertRawDataSet,
): Promise<{ insertedId: number }> => {
  const res = await db
    .insert(raw_data_sets)
    .values({
      file_name,
      file_path,
    })
    .returning({
      insertedId: result_views.id,
    })
    .get();

  return res;
}) satisfies IpcMainListener;
