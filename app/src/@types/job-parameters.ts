import { type z } from "zod";
import { type schema as modelCreateSchema } from "../hooks/use-form-model-create";
import { type NormalizationParameters } from "./normalization";

type BaseParameters = {
  output_path?: string; // ファイル出力が必要な場合のみ指定
  database_path: string; // SQLite データベースファイルのパス
};

type PreprocessParameters = NormalizationParameters;
type ModelCreateParameters = z.infer<typeof modelCreateSchema>;
type ResultParameters = z.infer<typeof modelCreateSchema>;

export type JobParameters = BaseParameters &
  (PreprocessParameters | ModelCreateParameters | ResultParameters);
