import {
  type InsertNormalizedDataSet,
  normalized_data_sets,
  result_views,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const insertNormalizedDatasets = (async (
  _: unknown,
  { file_name, file_path, job_results_id }: InsertNormalizedDataSet,
): Promise<{ insertedId: number }> => {
  const res = db
    .insert(normalized_data_sets)
    .values({
      file_name,
      file_path,
      job_results_id,
    })
    .returning({
      insertedId: result_views.id,
    })
    .get();

  return res;
}) satisfies IpcMainListener;
