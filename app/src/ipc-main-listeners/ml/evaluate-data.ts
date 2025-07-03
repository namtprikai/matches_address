import { spawn } from "child_process";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";
import { type ResultParameters } from "../../@types/job-parameters";
import { startJobProcess } from "./_start-job-process";

type Params = {
  data: ResultParameters;
};

/** IF003:空き家推定機能の呼び出し */
export const evaluateData = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  try {
    const output_path = dbDirectory;
    const database_path = dbPath;

    const jobProcess = await startJobProcess({ jobType: "result" });

    if (jobProcess.status !== "success") {
      console.error("Job process start failed");
      return false;
    }

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF003"),
      [
        "--parameters",
        JSON.stringify(
          JSON.stringify({
            ...data,
            job_id: jobProcess.data.jobId,
            output_path,
            database_path,
          }),
        ),
      ],
      {
        detached: true,
      },
    );

    processLogger(cp);

    return true;
  } catch (error) {
    console.error(getErrorMessage(error));
    return false;
  }
}) satisfies IpcMainListener;
