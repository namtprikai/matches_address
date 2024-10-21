import { type NormalizationParameters } from "../@types/normalization";

/**
 * 前処理で利用するデフォルトのパラメータを作成するだけの関数
 * インラインで書くとコードの見通しが悪くなるため追加
 *
 * @returns デフォルトの前処理用パラメータ
 */
export const getDefaultNormalizationParameter = (): NormalizationParameters => {
  return {
    settings: {
      referencedData: "waterStatus",
      referenceDate: "2021-01-01",
      advanced: {
        similarityThreshold: 0.95,
        nGramSize: 2,
        joiningMethod: "intersection",
      },
    },
    data: {
      residentRegistry: {},
      waterStatus: {},
      waterUsage: {},
      landRegistry: {},
      vacantHouse: {},
      geocoding: {},
      buildingPolygon: {},
      urbanPlanning: {},
    },
  };
};
