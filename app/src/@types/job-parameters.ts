import { type z } from "zod";
import { type schema as modelCreateSchema } from "../hooks/use-form-model-create";
import { type schema as normalizationSchema } from "../hooks/use-form-normalization";
import { type schema as resultSchema } from "../hooks/use-form-data-evaluate";
import { type Params as ExportFormParams } from "../ipc-main-listeners/ml/export-data";

type BaseParameters = {
  output_path?: string; // ファイル出力が必要な場合のみ指定
  database_path: string; // SQLite データベースファイルのパス
};

export type PreprocessParameters = { parameterType: "preprocess" } & z.infer<
  typeof normalizationSchema
>;
export type ModelCreateParameters = { parameterType: "ml" } & z.infer<
  typeof modelCreateSchema
>;
type ResultParameters = { parameterType: "result" } & z.infer<
  typeof resultSchema
>;

export type ExportParameters = {
  parameterType: "export";
} & ExportFormParams;

export type JobParameters = BaseParameters &
  (
    | PreprocessParameters
    | ModelCreateParameters
    | ResultParameters
    | ExportParameters
  );
