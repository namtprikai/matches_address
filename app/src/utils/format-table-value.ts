import { type ChartColumnType } from "../@types/charts";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用するため
export const formatTableValue = (
  value: number | string | null,
  metadata?: {
    unit?: string;
    percentage?: boolean;
    type: ChartColumnType;
  } | null,
  digits = 2,
) => {
  if (value === null) {
    return "";
  }

  if (typeof value !== "number") {
    return value;
  }

  if (typeof value === "number" && metadata?.type === "boolean") {
    return value === 1 ? "○" : "×";
  }

  return Number(value.toFixed(digits));
};
