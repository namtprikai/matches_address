import { type ChartColumnType, type ChartDynamicColumnInput, type ChartStyle } from "../@types/charts";

/**
 * 各チャートのパラーメーターやグルーピング可能かどうかなどの設定をハードコードで定義している
 * 永続化の必要がない（＝エンドユーザーが変更しない）点、
 * JSONで記述するよりも型補完が効く点を踏まえ柔軟にコードができるためにTypeScriptで記述した
 */
export const RESULT_VIEW_CONFIG = {
    // チャートスタイルごとにコンフィグを定義
    pie: {
        fields: [ // fieldsはパラメーターやフィルターの設定を行う
            {
                key: "label", // フィールドのキー(DBのparametersのkeyに対応)
                label: "ラベル", // フィールドのラベル、DBには保存せずkeyから引く形をとる
                type: "select", // フィールドの入力方法を指定
                accept: ["string", "date", "integer", "float"], // 設定可能なカラムの型を指定
                grouping: true
            },
            {
                key: "value",
                label: "値",
                type: "select",
                accept: ["integer", "float"],
                grouping: false
            },
        ],
    },
    bar: {
        fields: [
            {
                key: "xAxis",
                label: "X軸",
                type: "select",
                accept: ["string", "date", "integer", "float"],
                grouping: true
            },
            {
                key: "yAxis",
                label: "Y軸",
                type: "select",
                accept: ["integer", "float"],
                grouping: false
            },
        ],
    },
    line: {
        fields: [
            {
                key: "xAxis",
                label: "X軸",
                type: "select",
                accept: ["string", "date", "integer", "float"],
                grouping: true
            },
            {
                key: "yAxis",
                label: "Y軸",
                type: "select",
                accept: ["integer", "float"],
                grouping: false
            },
        ],
    },
    map: {
        fields: [],
    },
    table: {
        fields: [
            {
                key: "columns",
                label: "カラム",
                type: "dropdown",
                accept: ["string", "date", "integer", "float"],
                mutliple: true,
                grouping: false
            }
        ],
    },
} satisfies {
    [k in ChartStyle]: {
        fields: {
            key: string;
            label: string;
            type: ChartDynamicColumnInput;
            accept: ChartColumnType[];
            mutliple?: boolean;
            grouping: boolean
        }[];
    }
};