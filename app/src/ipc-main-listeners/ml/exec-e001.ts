import { spawn } from "child_process";
import { getErrorMessage } from "../../utils/get-error-message";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "..";
import { processLogger } from "../../utils/process-logger";
import { type PreprocessParameters } from "../../@types/job-parameters";
import { startJobProcess } from "./_start-job-process";

/** IF001:名寄せ処理機能の呼び出し */
export const execE001 = (async (
  _: unknown,
  {
    parameters,
  }: {
    parameters: PreprocessParameters;
  },
): Promise<true | false> => {
  try {
    const output_path = dbDirectory;
    const database_path = dbPath;

    const jobProcess = await startJobProcess({ jobType: "preprocess" });

    if (jobProcess.status !== "success") {
      console.error("Job process start failed");
      return false;
    }

    const postParameters = {
      ...parameters,
      output_path,
      database_path,
    };

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF001"),
      [
        "--parameters",
        JSON.stringify(
          JSON.stringify({
            ...postParameters,
            job_id: jobProcess.data.jobId,
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
