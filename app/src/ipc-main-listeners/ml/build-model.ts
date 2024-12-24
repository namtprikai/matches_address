import { spawn } from "child_process";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";
import { type ModelCreateParameters } from "../../@types/job-parameters";

type Params = {
  data: ModelCreateParameters;
};

export const buildModel = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;
  // 受け取ったデータを一度 Buffer を通して UTF-8 に変換
  const rawData = Buffer.from(JSON.stringify(params.data)).toString("utf8");
  const parsedData = JSON.parse(rawData);

  // eslint-disable-next-line no-console -- for debug @todo remove
  console.log("--- start buildModel ---", data);

  try {
    const output_path = dbDirectory;
    const database_path = dbPath;

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF002"),
      [
        "--parameters",
        JSON.stringify(
          JSON.stringify({
            ...parsedData,
            output_path,
            database_path,
          }),
        ),
      ],
      {
        detached: true,
        // Windowsで日本語が文字化けする問題の対応
        env: { ...process.env, PYTHONIOENCODING: "utf8" },
      },
    );

    cp.stdout.setEncoding("utf8");
    cp.stderr.setEncoding("utf8");

    processLogger(cp);

    return true;
  } catch (error) {
    console.error(getErrorMessage(error));
    return false;
  }
}) satisfies IpcMainListener;
