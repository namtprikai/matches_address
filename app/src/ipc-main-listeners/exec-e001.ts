import { spawn } from "child_process";
import { type NormalizationParameters } from "../@types/normalization";
import { getErrorMessage } from "../utils/get-error-message";
import { binaryPath, type IpcMainListener } from ".";

export const execE001 = (async (
  _: unknown,
  {
    parameters,
  }: {
    parameters: NormalizationParameters;
  },
): Promise<true | false> => {
  try {
    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("e001"),
      ["--parameters", JSON.stringify(JSON.stringify(parameters))],
      {
        detached: true,
      },
    );

    return true;
  } catch (error) {
    console.error(getErrorMessage(error));
    return false;
  }
}) satisfies IpcMainListener;
