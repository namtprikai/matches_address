import { type ChartColumnType } from "../@types/charts";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用するため
export const formatChartValue = (
  value: number | string,
  metadata?: {
    unit?: string;
    percentage?: boolean;
    type: ChartColumnType;
  },
  digits = 2,
) => {
  if (typeof value !== "number") {
    return value;
  }
  return Number(value.toFixed(digits));
};
