import { spawn } from "child_process";
import { type NormalizationParameters } from "../../@types/normalization";
import { getErrorMessage } from "../../utils/get-error-message";
import { dbDirectoryPath, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "..";
import { processLogger } from "../../utils/process-logger";

export type ExecE001Args = NormalizationParameters;

export const execE001 = (async (
  _: unknown,
  {
    parameters,
  }: {
    parameters: NormalizationParameters;
  },
): Promise<true | false> => {
  try {
    const output_path = dbDirectoryPath;
    const database_path = dbPath;

    const postParameters = {
      ...parameters,
      output_path,
      database_path,
    };

    // Pythonコードがないため実行不可なのでコメントアウト
    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF002"),
      ["--parameters", JSON.stringify(JSON.stringify(postParameters))],
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
