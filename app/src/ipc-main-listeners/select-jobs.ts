import { db } from "../utils/db";
import { jobs, type SelectJob } from "../schema";
import { type IpcMainListener } from ".";

export const selectJobs = (async (): Promise<SelectJob[]> => {
  const result = await db.select().from(jobs);
  return result;
}) satisfies IpcMainListener;
