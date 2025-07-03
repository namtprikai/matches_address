import { spawn } from "child_process";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "..";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";
import { type ExportParameters } from "../../@types/job-parameters";
import { startJobProcess } from "./_start-job-process";

/** IF004:データ出力機能の呼び出し */
export const exportData = (async (
  _: unknown,
  params: {
    data: ExportParameters;
  },
): Promise<boolean> => {
  const { data } = params;

  try {
    const output_path = dbDirectory;
    const database_path = dbPath;

    const jobProcess = await startJobProcess({ jobType: "export" });

    if (jobProcess.status !== "success") {
      throw new Error("Job process start failed");
    }

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF004"),
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
    throw new Error(getErrorMessage(error));
  }
}) satisfies IpcMainListener;
