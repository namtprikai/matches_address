import { type IpcMainInvokeEvent } from "electron";
import { eq } from "drizzle-orm";
import { db } from "../utils/db";
import { jobs, type SelectJob } from "../schema";
import { type IpcMainListener } from ".";

export const selectJobs = (async (
  _: IpcMainInvokeEvent,
  jobId?: SelectJob["id"],
): Promise<SelectJob[]> => {
  const result = jobId
    ? await db.select().from(jobs).where(eq(jobs.id, jobId))
    : await db.select().from(jobs);
  return result;
}) satisfies IpcMainListener;
