import { type z } from "zod";
import { jobs, job_tasks } from "../../schema";
import { db } from "../../utils/db";
import { type IpcMainListener } from "../";
import { type schema } from "../../hooks/use-form-model-create";

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
): Promise<void> => {
  const { data } = params;

  /**
   * モデル構築の流れをモックする処理
   * 実際は、Pythonによるモデルの構築処理を呼び出すのみ
   */
  await db.transaction(async (tx) => {
    // jobsテーブルへ登録し、job_idを取得、このjob_idを使ってjob_tasksテーブルへ登録する
    const { id: job_id } = tx
      .insert(jobs)
      /** @todo 型定義をSchemaに提供する */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- @todo
      // @ts-ignore
      .values({ status: "", type: "ml", parameters: { ...params } })
      .returning()
      .get();

    await tx.insert(job_tasks).values({
      job_id,
      progress_percent: "0%",
      preprocess_type: "住居単位データ作成",
    });
    await tx.insert(job_tasks).values({
      job_id,
      progress_percent: "0%",
      preprocess_type: "住居単位データ作成",
    });

    /** デフォルト値を設定 */
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

    // モデル構築処理をPythonに投げる
    JSON.stringify(post);
  });
}) satisfies IpcMainListener;
