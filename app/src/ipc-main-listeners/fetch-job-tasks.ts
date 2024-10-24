import { type IpcMainInvokeEvent } from "electron";
import { eq } from "drizzle-orm";
import { db } from "../utils/db";
import { job_tasks, type SelectJobTask } from "../schema";

export const fetchJobTasks = async (
  event: IpcMainInvokeEvent,
  id: number,
): Promise<SelectJobTask[]> => {
  const result = await db.select().from(job_tasks).where(eq(job_tasks.job_id, id));
  return result;
};
