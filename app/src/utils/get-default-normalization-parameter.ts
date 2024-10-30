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
      referenceData: "waterStatus",
      referenceDate: "2021-01-01",
      advanced: {
        similarityThreshold: 0.95,
        nGramSize: 2,
        joiningMethod: "intersection",
      },
    },
    data: {
      residentRegistry: {
        path: undefined,
        columns: {
          householdCode: undefined,
          address: undefined,
          birthDate: undefined,
          gender: undefined,
          residentDate: undefined,
        },
      },
      waterStatus: {
        path: undefined,
        columns: {
          waterSupplyNumber: undefined,
          waterDisconnectionDate: undefined,
          waterConnectionDate: undefined,
          waterDisconnectionFlag: undefined,
          address: undefined,
        },
      },
      waterUsage: {
        path: undefined,
        columns: {
          waterSupplyNumber: undefined,
          waterUsage: undefined,
          waterRecordedDate: undefined,
        },
      },
      landRegistry: {
        path: undefined,
        columns: {
          address: undefined,
          structureName: undefined,
          registrationDate: undefined,
        },
      },
      vacantHouse: {
        path: undefined,
        columns: {
          vacantHouseId: undefined,
          address: undefined,
          latitude: undefined,
          longitude: undefined,
        },
      },
      geocoding: {
        path: undefined,
        columns: {
          address: undefined,
          latitude: undefined,
          longitude: undefined,
        },
      },
      buildingPolygon: {
        path: undefined,
        columns: {
          buildingId: undefined,
        },
      },
      urbanPlanning: {
        path: undefined,
      },
    },
  };
};
