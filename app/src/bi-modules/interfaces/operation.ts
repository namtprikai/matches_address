// 各referenceColumnType別の型定義
type TextFilterCondition = {
  referenceColumnType: "text";
  referenceColumn: string;
  value: string;
  operation: "eq" | "noteq" | "contains" | "notContains";
};

type NumberFilterCondition = {
  referenceColumnType: "integer" | "float";
  referenceColumn: string;
} & (
  | {
      operation: "eq" | "noteq" | "gt" | "lt" | "gte" | "lte";
      value: number;
    }
  | {
      operation: "range";
      startValue: number;
      lastValue: number;
      includesStart: boolean;
      includesLast: boolean;
    }
);

type DateFilterCondition = {
  referenceColumnType: "date";
  referenceColumn: string;
} & (
  | {
      operation: "eq" | "noteq" | "gt" | "lt" | "gte" | "lte";
      value: string;
    }
  | {
      operation: "range";
      startValue: string;
      lastValue: string;
      includesStart: boolean;
      includesLast: boolean;
    }
);

type BooleanFilterCondition = {
  referenceColumnType: "boolean";
  referenceColumn: string;
  operation: "isTrue" | "isFalse";
  value: undefined;
};

// メインのFilterCondition型
export type FilterConditionValue =
  | TextFilterCondition
  | NumberFilterCondition
  | DateFilterCondition
  | BooleanFilterCondition;
