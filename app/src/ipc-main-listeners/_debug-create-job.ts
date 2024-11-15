import { spawn } from "child_process";
import { jobs, type InsertJob } from "../schema";
import { db, dbDirectoryPath, dbPath } from "../utils/db";
import { type IpcMainListener } from ".";

type Params = {
  job: "処理開始" | "処理完了" | "処理失敗";
  jobType: InsertJob["type"];
  parameters: InsertJob["parameters"];
};

export const _debugCreateJob = (async (
  _: unknown,
  { job, jobType, parameters }: Params,
): Promise<void> => {
  const cp = spawn("echo", ["test"], {
    detached: true,
  });

  const output_path = dbDirectoryPath;
  const database_path = dbPath;
  const { parameterType } = parameters;

  db.insert(jobs)
    .values({
      status:
        job === "処理開始" ? "" : job === "処理完了" ? "complete" : "error",
      type: jobType,
      is_named: false,
      process_id: cp.pid,
      parameters: {
        ...parameters,
        output_path,
        database_path,
      },
    })
    .returning({ insertedId: jobs.id })
    .get();
}) satisfies IpcMainListener;
