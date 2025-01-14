import { eq } from "drizzle-orm";
import { jobs, job_tasks, job_results, type SelectJob } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const deleteJob = (async (
  _: unknown,
  { id }: { id: SelectJob["id"] },
): Promise<void> => {
  await db.transaction(async (tx) => {
    // 1) job_tasks を先に削除
    await tx.delete(job_tasks).where(eq(job_tasks.job_id, id)).run();

    // 2) job_results を削除
    await tx.delete(job_results).where(eq(job_results.job_id, id)).run();

    // 3) jobs を最後に削除
    await tx.delete(jobs).where(eq(jobs.id, id)).run();
  });
}) satisfies IpcMainListener;
