type PreprocessTaskResult = {
  joining_rate: string;
};

type ModelCreateTaskResult = {
  accuracy: string; // 正解率
  f1Score: string; // f値
  specificity: string; // 特異度
  precision: string; // 適合率
  recall: string; // 再現率
  important_columns: { column: string; value: string }[];
};

/** @todo / 命名のリファクタも */
type ResultTaskResult = Record<string, string>;

export type JobTaskResult =
  | PreprocessTaskResult
  | ModelCreateTaskResult
  | ResultTaskResult;
