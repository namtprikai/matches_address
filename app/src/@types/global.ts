/**
 * 必須パラメータを再帰的にオプショナルにする
 * 既存のDeepPartialだと、配列の型が壊れるので自作してます
 * https://zenn.dev/ksyunnnn/articles/7eb8fafed74e4e
 */
export type DeepPartial<T> =
  T extends Array<infer U>
    ? Array<U>
    : T extends object
      ? {
          [P in keyof T]?: DeepPartial<T[P]>;
        }
      : T;
