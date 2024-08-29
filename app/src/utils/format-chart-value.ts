export const formatChartValue = (value: number | string, percentage?: boolean, digits = 2): number | string => {

    if (typeof value !== "number") {
        return value;
    }

    if (percentage) {
        return Number((value * 100).toFixed(digits));
    }
    return Number(value.toFixed(digits));
}