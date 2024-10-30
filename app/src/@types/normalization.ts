/**
 * WIP
 * この型定義は検討途中のものであり、最終的な型定義ではないです
 *
 * Parameterの命名については以下資料参照
 * https://www.notion.so/eukarya/10-16-MB-9807c808cea74b0cbbad3
 * ed701ed38cb?pvs=4
 *
 * TODO: 要件定義資料ないしは他の公開資料に上記資料を置き換える
 */

export type NormalizationParameters = {
  settings: {
    referenceData: "waterStatus" | "residentRegistry";
    referenceDate: string;
    advanced: {
      similarityThreshold: number; // Default 0.95
      nGramSize: 1 | 2 | 3; // Default 2
      joiningMethod: "intersection" | "nearest"; // Default intersection
    };
  };
  data: {
    residentRegistry: {
      path?: string;
      columns?: {
        householdCode?: string;
        gender?: string;
        address?: string;
        birthDate?: string;
        residentDate?: string;
      };
    };
    waterStatus: {
      path?: string;
      columns?: {
        waterSupplyNumber?: string;
        waterDisconnectionDate?: string;
        waterConnectionDate?: string;
        waterDisconnectionFlag?: string;
        address?: string;
      };
    };
    waterUsage: {
      path?: string;
      columns?: {
        waterSupplyNumber?: string;
        waterUsage?: string;
        waterRecordedDate?: string;
      };
    };
    landRegistry: {
      path?: string;
      columns?: {
        address?: string;
        structureName?: string;
        registrationDate?: string;
      };
    };
    vacantHouse: {
      path?: string;
      columns?: {
        vacantHouseId?: string;
        address?: string;
        latitude?: string;
        longitude?: string;
      };
    };
    geocoding: {
      path?: string;
      columns?: {
        address?: string;
        latitude?: string;
        longitude?: string;
      };
    };
    buildingPolygon: {
      path?: string;
      columns?: {
        buildingId?: string;
      };
    };
    urbanPlanning: {
      path?: string;
    };
  };
};
