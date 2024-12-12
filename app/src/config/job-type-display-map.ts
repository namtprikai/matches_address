export enum JobType {
  Preprocess = "preprocess",
  ML = "ml",
  Result = "result",
  Export = "export",
}

export const TYPE_DISPLAY_MAP: Record<JobType, string> = {
  [JobType.Preprocess]: "前処理",
  [JobType.ML]: "モデル作成",
  [JobType.Result]: "空き家判定処理",
  [JobType.Export]: "ダウンロード準備",
};
