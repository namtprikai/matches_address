import { spawn } from "child_process";
import { type z } from "zod";
import { dbPath } from "../../utils/db";
import { binaryPath, type IpcMainListener } from "../";
import { type schema } from "../../hooks/use-form-model-create";
import { getFilePathInAssets } from "../../utils/get-file-path-in-assets";
import { getErrorMessage } from "../../utils/get-error-message";

interface IPost {
  path: string;
  settings: {
    explanatory_variables: string[];
    advanced: {
      test_size: number;
      n_splits: number;
      undersample: boolean;
      undersample_ratio: number;
      threshold: number;
      hyperparameter_flag: boolean;
      n_trials: number;
      lambda_l1: number;
      lambda_l2: number;
      num_leavs: number;
      feature_fraction: number;
      bagging_fraction: number;
      bagging_freq: number;
      min_data_in_leaf: number;
    };
  };
}

type Params = {
  data: z.infer<typeof schema>;
};

export const buildModel = (async (
  _: unknown,
  params: Params,
): Promise<boolean> => {
  const { data } = params;

  /** デフォルト値を設定 */
  /** @todo 標準値はここではなく、RHF側でセットする */
  const post: IPost = {
    path: data.path,
    settings: {
      explanatory_variables: data.settings.explanatory_variables,
      advanced: {
        test_size: data.settings?.advanced?.test_size || 0,
        n_splits: data.settings?.advanced?.n_splits || 0,
        undersample: data.settings?.advanced?.undersample || false,
        undersample_ratio: data.settings?.advanced?.undersample_ratio || 0,
        threshold: data.settings?.advanced?.threshold || 0,
        hyperparameter_flag:
          data.settings?.advanced?.hyperparameter_flag || false,
        n_trials: data.settings?.advanced?.n_trials || 0,
        lambda_l1: data.settings?.advanced?.lambda_l1 || 0,
        lambda_l2: data.settings?.advanced?.lambda_l2 || 0,
        num_leavs: data.settings?.advanced?.num_leavs || 0,
        feature_fraction: data.settings?.advanced?.feature_fraction || 0,
        bagging_fraction: data.settings?.advanced?.bagging_fraction || 0,
        bagging_freq: data.settings?.advanced?.bagging_freq || 0,
        min_data_in_leaf: data.settings?.advanced?.min_data_in_leaf || 0,
      },
    },
  };

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
            ...post,
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
