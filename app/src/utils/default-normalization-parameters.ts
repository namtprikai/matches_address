import { type z } from "zod";
import { type schema as normalizationSchema } from "../hooks/use-form-normalization";

/**
 * 名寄せ処理で利用するデフォルトのパラメータを作成するだけの関数
 * インラインで書くとコードの見通しが悪くなるため追加
 *
 * @returns デフォルトの名寄せ処理用パラメータ
 */
export const defaultNormalizationParameters: z.infer<
  typeof normalizationSchema
> = {
  settings: {
    reference_date: "2021-01-01",
    advanced: {
      similarity_threshold: 0.95,
      n_gram_size: 2,
      joining_method: "intersection",
    },
  },
  data: {
    resident_registry: {
      id: 0,
      path: "",
      columns: {
        household_code: "",
        address: "",
        birth_date: "",
        gender: "",
        resident_date: "",
      },
    },
    water_status: {
      id: 0,
      path: "",
      columns: {
        water_supply_number: "",
        water_disconnection_date: "",
        water_connection_date: "",
        water_disconnection_flag: "",
        address: "",
      },
    },
    water_usage: {
      id: 0,
      path: "",
      columns: {
        water_supply_number: "",
        water_usage: "",
        water_recorded_date: "",
      },
    },
    land_registry: {
      id: 0,
      path: "",
      columns: {
        address: "",
        structure_name: "",
        registration_date: "",
        building_detail: "",
      },
    },
    vacant_house: {
      id: 0,
      path: "",
      columns: {
        address: "",
      },
    },
    census: { id: 0, path: "" },
    reverse_geocoded_building_polygon: {
      id: 0,
      path: "",
      columns: {
        address: "",
        geometry: "",
      },
    },
    residential_addresses: {
      id: 0,
      path: "",
      columns: {
        land_number_address: "",
        residential_address: "",
      },
    },
    address_of_lot_number: {
      id: 0,
      path: "",
      input_file_type: "csv",
      columns: {
        lat: "",
        lon: "",
      },
    },
    building_type_determination: {
      id: 0,
      path: "",
      input_file_type: "csv",
      columns: {
        address: "",
        building_type: "",
      },
    },
  },
};
