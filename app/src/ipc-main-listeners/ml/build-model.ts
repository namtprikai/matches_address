import { spawn } from "child_process";
import { type z } from "zod";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { type schema } from "../../hooks/use-form-model-create";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";

type Params = {
  data: z.infer<typeof schema>;
};

export const buildModel = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  // eslint-disable-next-line no-console -- for debug @todo remove
  console.log("--- start buildModel ---", data);

  try {
    const output_path = dbDirectory; // すべてのファイル配置先の絶対パス
    const database_path = dbPath; // データベース本体の絶対パス SQLiteの書き込みのための

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF002"),
      [
        "--parameters",
        JSON.stringify(
          JSON.stringify({
            ...data,
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
