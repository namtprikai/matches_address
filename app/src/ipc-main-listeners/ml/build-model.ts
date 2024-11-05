import { spawn } from "child_process";
import { type z } from "zod";
import { dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { type schema } from "../../hooks/use-form-model-create";
import { getFilePathInAssets } from "../../utils/get-file-path-in-assets";
import { getErrorMessage } from "../../utils/get-error-message";

type Params = {
  data: z.infer<typeof schema>;
};

export const buildModel = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  try {
    const output_path = getFilePathInAssets();
    const database_path = dbPath;

    // childProcessに入れてバックグラウンド実行
    // ※pidはここで受け取れるはず
    const cp = spawn(
      binaryPath("E021"),
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

    cp.stdout.on("data", (data) => {
      // eslint-disable-next-line no-console -- /** @todo for debug  */
      console.log("stdout" + data);
      // resolve(data);
    });
    cp.stderr.on("data", (data) => {
      // eslint-disable-next-line no-console -- /** @todo for debug  */
      console.log("stderr" + data);
      // reject(data);
    });

    return true;
  } catch (error) {
    console.error(getErrorMessage(error));
    return false;
  }
}) satisfies IpcMainListener;
