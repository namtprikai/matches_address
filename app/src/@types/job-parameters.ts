import { type z } from "zod";
import { type schema as modelCreateSchema } from "../hooks/use-form-model-create";
import { type NormalizationParameters } from "./normalization";

type BaseParameters = {
  output_path?: string; // ファイル出力が必要な場合のみ指定
  database_path: string; // SQLite データベースファイルのパス
};

export type PreprocessParameters = NormalizationParameters;
export type ModelCreateParameters = z.infer<typeof modelCreateSchema>;
export type ResultParameters = z.infer<
  typeof modelCreateSchema
>; /** @todo 空き家判定の実装落ち着いてから */

export type JobParameters = BaseParameters &
  (PreprocessParameters | ModelCreateParameters);
