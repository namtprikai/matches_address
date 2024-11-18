import { type InsertJob, jobs, result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const _debugInsertJobs = (async (
  _: unknown,
  { type, parameters }: InsertJob,
): Promise<{ insertedId: number }> => {
  const res = await db
    .insert(jobs)
    .values({
      type,
      parameters,
    })
    .returning({
      insertedId: result_views.id,
    })
    .get();

  return res;
}) satisfies IpcMainListener;
