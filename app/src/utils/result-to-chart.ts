// 開発用のコードで本番環境で利用しない可能性があるため、仮で作成

import { type ChartProps, type ChartData } from "../@types/charts";
import { type data_set_detail_areas, type data_set_detail_buildings } from "../schema"


type ResultToChartArg = {
    type: "buidldings",
    data: typeof data_set_detail_buildings.$inferSelect[]
    xAxis: keyof typeof data_set_detail_buildings.$inferSelect;
    yAxis: keyof typeof data_set_detail_buildings.$inferSelect;
} | {
    type: "areas",
    data: typeof data_set_detail_areas.$inferSelect[]
    xAxis: keyof typeof data_set_detail_areas.$inferSelect;
    yAxis: keyof typeof data_set_detail_areas.$inferSelect;
}

export const resultToChartProps = (prop: ResultToChartArg): ChartProps | undefined => {

    if (prop.type === "buidldings") {
        return {
            data: prop.data.map((item) => ({
                x: item[prop.xAxis] ?? "",
                y: item[prop.yAxis] as number,
            })),
            xAxisColumn: {
                type: "string",
            },
            yAxisColumn: {
                type: "number",
            }
        }
    }

    if (prop.type === "areas") {
        return {
            data: prop.data.map((item) => ({
                x: item[prop.xAxis] ?? "",
                y: item[prop.yAxis] as number,
            })),
            xAxisColumn: {
                type: "string",
            },
            yAxisColumn: {
                type: "number",
            }
        }
    }

    return;
}