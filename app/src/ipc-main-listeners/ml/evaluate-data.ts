import { spawn } from "child_process";
import { type z } from "zod";
import { dbDirectoryPath, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { type schema } from "../../hooks/use-form-data-evaluate";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";

type Params = {
  data: z.infer<typeof schema>;
};

export const evaluateData = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  // eslint-disable-next-line no-console -- for debug @todo remove
  console.log("--- start evaluateData ---", data);

  try {
    const output_path = dbDirectoryPath;
    const database_path = dbPath;

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("E022"),
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
