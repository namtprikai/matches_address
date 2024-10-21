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
      residentRegistry: {
        filePath: undefined,
        columns: {
          householdCode: undefined,
          address: undefined,
          birthDate: undefined,
          gender: undefined,
          residentDate: undefined,
        },
      },
      waterStatus: {
        filePath: undefined,
        columns: {
          waterSupplyNumber: undefined,
          waterDisconnectionDate: undefined,
          waterConnectionDate: undefined,
          waterDisconnectionFlag: undefined,
          address: undefined,
        },
      },
      waterUsage: {
        filePath: undefined,
        columns: {
          waterSupplyNumber: undefined,
          waterUsage: undefined,
          waterRecordedDate: undefined,
        },
      },
      landRegistry: {
        filePath: undefined,
        columns: {
          address: undefined,
          structureName: undefined,
          registrationDate: undefined,
        },
      },
      vacantHouse: {
        filePath: undefined,
        columns: {
          vacantHouseId: undefined,
          address: undefined,
          latitude: undefined,
          longitude: undefined,
        },
      },
      geocoding: {
        filePath: undefined,
        columns: {
          address: undefined,
          latitude: undefined,
          longitude: undefined,
        },
      },
      buildingPolygon: {
        filePath: undefined,
        columns: {
          buildingId: undefined,
        },
      },
      urbanPlanning: {
        filePath: undefined,
      },
    },
  };
};
