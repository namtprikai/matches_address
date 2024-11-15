import { type z } from "zod";
import { type schema as modelCreateSchema } from "../hooks/use-form-model-create";
import { type NormalizationParameters } from "./normalization";

type BaseParameters = {
  output_path: string;
  database_path?: string;
};

type PreprocessParameters = NormalizationParameters;
type ModelCreateParameters = z.infer<typeof modelCreateSchema>;
type ResultParameters = z.infer<typeof modelCreateSchema>;

export type JobParameters = BaseParameters &
  (PreprocessParameters | ModelCreateParameters | ResultParameters);
