import { type SelectRawDataSet } from "../schema";

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
    reference_data: "water_status" | "resident_registry";
    reference_date: string;
    advanced: {
      similarity_threshold: number; // Default 0.95
      n_gram_size: 1 | 2 | 3; // Default 2
      joining_method: "intersection" | "nearest"; // Default intersection
    };
  };
  data: {
    resident_registry: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        household_code: string;
        gender: string;
        address: string;
        birth_date: string;
        resident_date: string;
      };
    };
    water_status: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        water_supply_number: string;
        water_disconnection_date: string;
        water_connection_date: string;
        water_disconnection_flag: string;
        address: string;
      };
    };
    water_usage: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        water_supply_number: string;
        water_usage: string;
        water_recorded_date: string;
      };
    };
    land_registry: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        address: string;
        structure_name: string;
        registration_date: string;
      };
    };
    vacant_house: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        vacant_house_id: string;
        address: string;
        latitude: string;
        longitude: string;
      };
    };
    geocoding: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        address: string;
        latitude: string;
        longitude: string;
      };
    };
    building_polygon: {
      id: SelectRawDataSet["id"];
      path: string;
      columns: {
        building_id: string;
      };
    };
    urban_planning: {
      id: SelectRawDataSet["id"];
      path: string;
    };
    census: {
      id: SelectRawDataSet["id"];
      path: string;
    };
  };
};
