import { jobs, job_tasks } from "../../schema";
import { db } from "../../utils/db";
import { type IpcMainListener } from "../";

/** @todo WIP */
type Params = {
  foo: string;
};

export const buildModel = (async (
  _: unknown,
  params: Params,
): Promise<void> => {
  /**
   * モデル構築の流れをモックする処理
   * 実際は、Pythonによるモデルの構築処理を呼び出すのみ
   */
  await db.transaction(async (tx) => {
    // jobsテーブルへ登録し、job_idを取得、このjob_idを使ってjob_tasksテーブルへ登録する
    const { id: job_id } = await tx
      .insert(jobs)
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
  });
}) satisfies IpcMainListener;
