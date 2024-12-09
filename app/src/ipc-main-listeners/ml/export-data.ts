import { spawn } from "child_process";
import { dbDirectory, dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "..";
import { getErrorMessage } from "../../utils/get-error-message";
import { processLogger } from "../../utils/process-logger";

type Params = {
  data: {
    output_file_type: string;
    output_coordinate: string;
    target_unit: "building" | "area";
    data_set_results_id: number;
    reference_date: string;
  };
};

export const exportData = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  // eslint-disable-next-line no-console -- for debug @todo remove
  console.log("--- start exportData ---", data);

  try {
    const output_path = dbDirectory;
    const database_path = dbPath;

    // childProcessに入れてバックグラウンド実行
    const cp = spawn(
      binaryPath("IF004"),
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
