export const formatChartValue = (value: number, percentage?: boolean, digits = 2): number => {
    if (percentage) {
        return Number((value * 100).toFixed(digits));
    }
    return Number(value.toFixed(digits));
}