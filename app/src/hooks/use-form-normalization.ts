import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/** https://www.notion.so/eukarya/Python-40f49a4c1a3b498486dd0e13aaad5a4a */
export const schema = z.object({
  settings: z.object({
    reference_date: z.string(),
    advanced: z.object({
      similarity_threshold: z.coerce.number().default(0.95),
      n_gram_size: z.number().default(2),
      joining_method: z
        .enum(["intersection", "nearest"])
        .default("intersection"),
    }),
  }),
  data: z.object({
    resident_registry: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        household_code: z.string(),
        gender: z.string(),
        address: z.string(),
        birth_date: z.string(),
        resident_date: z.string(),
      }),
    }),
    water_status: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        water_supply_number: z.string(),
        water_disconnection_date: z.string(),
        water_connection_date: z.string(),
        water_disconnection_flag: z.string(),
        address: z.string(),
      }),
    }),
    water_usage: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        water_supply_number: z.string(),
        water_usage: z.string(),
        water_recorded_date: z.string(),
      }),
    }),
    land_registry: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        address: z.string(),
        structure_name: z.string(),
        registration_date: z.string(),
        building_detail: z.string(),
      }),
    }),
    vacant_house: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        address: z.string(),
      }),
    }),
    census: z.object({
      id: z.number(),
      path: z.string(),
    }),
    reverse_geocoded_building_polygon: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        address: z.string(),
        geometry: z.string(),
      }),
    }),
    residential_addresses: z.object({
      id: z.number(),
      path: z.string(),
      columns: z.object({
        land_number_address: z.string(),
        residential_address: z.string(),
      }),
    }),
    address_of_lot_number: z.object({
      id: z.number(),
      path: z.string(),
      input_file_type: z.enum(["csv", "geopackage", "shapefile"]),
      columns: z.object({
        lat: z.string(), // 緯度 if csv file
        lon: z.string(), // 経度 if csv file
      }),
    }),
    building_type_determination: z.object({
      id: z.number(),
      path: z.string(),
      input_file_type: z.enum(["csv", "geopackage", "shapefile"]),
      columns: z.object({
        address: z.string(), // 住所  if csv file
        building_type: z.string(), // 建物種別
      }),
      residential_values: z.array(z.string()), // 住宅地の値
    }),
  }),
});
export type FormNormalizationType = z.infer<typeof schema>;

export const useFormNormalization = ({
  defaultValues,
}: {
  defaultValues?: FormNormalizationType;
}): UseFormReturn<FormNormalizationType> => {
  return useForm<FormNormalizationType>({
    defaultValues: defaultValues ?? {
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
    },
    resolver: zodResolver(schema),
  });
};
