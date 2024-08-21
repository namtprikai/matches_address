import { type ChartDynamicColumnInput } from "../@types/charts";
import { CHART_CONFIG } from "../config/chart-config";
import { type ChartColumnType } from "../config/data-columns";

export const getChartFieldOption = (
    style: "pie" | "bar" | "line" | "table" | "map",
    key: string): {
        key: string;
        label: string;
        type: ChartDynamicColumnInput;
        accept: readonly ChartColumnType[];
    } | undefined => {

    // ハードコーディングされたチャートごとの設定を取得
    const options = CHART_CONFIG[style];

    // チャート設定からパラメーターフィールドに使う値を取得
    const optionFields = options ? options.fields : [];

    // 設定に含まれるパラメーターフィールドのうち、現在のフィールドに対応するものを取得
    // item.key -> パラメーターフィールドのキー
    // field.key -> map中のDBもしくはRHFで管理されているParamterオブジェクトのキー
    const optionField = optionFields.find((item) => item.key === key);

    return optionField
}
