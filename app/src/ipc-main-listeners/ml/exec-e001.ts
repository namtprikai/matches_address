import { type NormalizationParameters } from "../../@types/normalization";
import { getErrorMessage } from "../../utils/get-error-message";
import { dbPath } from "../../utils/db";
import { type IpcMainListener } from "..";

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
    const output_path = dbPath;
    const database_path = dbPath;

    const postParameters = {
      ...parameters,
      output_path,
      database_path,
    };

    // Pythonコードがないため実行不可なのでコメントアウト
    // childProcessに入れてバックグラウンド実行
    // const cp = spawn(
    //   binaryPath("e001"),
    //   ["--parameters", JSON.stringify(JSON.stringify(postParameters))],
    //   {
    //     detached: true,
    //   },
    // );

    return true;
  } catch (error) {
    console.error(getErrorMessage(error));
    return false;
  }
}) satisfies IpcMainListener;
