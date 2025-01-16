import { type ChartColumnType } from "../@types/charts";

export const formatChartValue = (
  value: number | string,
  metadata?: {
    unit?: string;
    percentage?: boolean;
    type: ChartColumnType;
  },
  digits = 3,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用するため
) => {
  if (typeof value !== "number") {
    return value;
  }
  return Number(value.toFixed(digits));
};
