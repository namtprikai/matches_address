/** @todo たぶんpreprocess_typeごとに違う？ */
type PreprocessResult = Record<string, string>;

type ModelCreateResult = {
  accuracy: string; // 正解率
  f1Score: string; // f値
  specificity: string; // 特異度
  precision: string; // 適合率
  recall: string; // 再現率
  important_columns: { column: string; value: string }[];
};

/** @todo / 命名のリファクタも */
type ResultResult = Record<string, string>;

export type JobTaskResult = PreprocessResult | ModelCreateResult | ResultResult;
