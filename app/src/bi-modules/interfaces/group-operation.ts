// 基本となる型定義
type TextGroupingCondition = {
  label: string;
  referenceColumnType: "text";
  value: string;
  operation: "eq" | "noteq" | "contains" | "notContains";
};

type NumberGroupingCondition = {
  label: string;
  referenceColumnType: "integer" | "float";
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

type DateGroupingCondition = {
  label: string;
  referenceColumnType: "date";
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

type BooleanGroupingCondition = {
  label: string;
  referenceColumnType: "boolean";
  operation: "isTrue" | "isFalse";
  value: undefined;
};

// GroupingConditionの定義
export type GroupConditionValue =
  | TextGroupingCondition
  | NumberGroupingCondition
  | DateGroupingCondition
  | BooleanGroupingCondition;
