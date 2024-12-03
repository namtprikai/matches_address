import { readFile } from "fs/promises";
import { type FeatureCollection } from "geojson";
import {
  data_set_results,
  data_set_detail_areas,
  data_set_detail_buildings,
} from "../schema";
import { db } from "../utils/db";
import { getFilePathInPublic } from "../utils/get-file-path-in-public";
import { TOYOTA_AREAS } from "./dummy-area";
import { type IpcMainListener } from ".";

// 開発用
export const createDummyDataSetResults = (async (
  _: unknown,
  { full = false, title }: { full: boolean; title: string },
): Promise<void> => {
  try {
    console.info("Creating dummy data set results...");

    // 建物データをJSONファイルから取得する
    const d902 = await Promise.all(
      Array.from({ length: full ? 10 : 1 }, (_, i) => i + 1).map(async (i) => {
        const filePath = getFilePathInPublic("D902", `${i}.json`);
        const rawData = await readFile(filePath, { encoding: "utf8" });
        const jsonData: FeatureCollection = JSON.parse(rawData.toString());
        return jsonData;
      }),
    );

    const d903 = await (async () => {
      const filePath = getFilePathInPublic("D903.json");
      const rawData = await readFile(filePath, { encoding: "utf8" });
      const jsonData: FeatureCollection = JSON.parse(rawData.toString());
      return jsonData;
    })();

    const buildingFeatures = d902.flatMap((f) => f.features);
    const areaFeatures = d903.features;
    const chunkSize = 500;
    const chunkedBuildingFeatures = Array.from(
      { length: Math.ceil(buildingFeatures.length / chunkSize) },
      (_, i) =>
        buildingFeatures.slice(i * chunkSize, i * chunkSize + chunkSize),
    );
    const chunkedAreaFeatures = Array.from(
      { length: Math.ceil(areaFeatures.length / chunkSize) },
      (_, i) => areaFeatures.slice(i * chunkSize, i * chunkSize + chunkSize),
    );

    await db.transaction(async (tx) => {
      const res = await tx
        .insert(data_set_results)
        .values({ title })
        .returning();
      const data_set_result_id = res[0].id;

      const years = [2019, 2020, 2021, 2022, 2023];

      for (const year of years) {
        const reference_date = `${year}-04-02`;
        const totalAreas = areaFeatures.length;
        console.info(
          `Area: Starting data insertion for year ${year}. Total areas: ${totalAreas}`,
        );

        for (const chunk of chunkedAreaFeatures) {
          const features = chunk;

          await Promise.all(
            features.map(async (feature, i) => {
              await tx.insert(data_set_detail_areas).values({
                data_set_result_id,
                reference_date,
                predicted_probability: Math.random() * 100,
                area_group:
                  TOYOTA_AREAS[Math.floor(Math.random() * TOYOTA_AREAS.length)],
                young_population_ratio: Math.floor(Math.random() * 100),
                elderly_population_ratio: Math.floor(Math.random() * 100),
                total_building_count: Math.floor(Math.random() * 100),
                area: Math.floor(Math.random() * 100),
                vacant_house_count: Math.floor(Math.random() * 100),
                geometry:
                  feature.geometry.type === "Polygon"
                    ? JSON.stringify(feature.geometry.coordinates) // 多重配列はsqliteに入らないので文字列に変換する
                    : "",
                key_code: `key_code_${i}`,
              });
            }),
          );
        }
      }

      for (const year of years) {
        const reference_date = `${year}-04-02`;
        const totalBuildings = buildingFeatures.length;
        console.info(
          `Buildings: Starting data insertion for year ${year}. Total buildings: ${totalBuildings}`,
        );

        for (const [chunkIndex, chunk] of chunkedBuildingFeatures.entries()) {
          const features = chunk;

          await Promise.all(
            features.map(async (feature, i) => {
              const number_of_people_under_15_years_old = Math.floor(
                Math.random() * 10,
              );
              const number_of_people_aged_15_to_64 = Math.floor(
                Math.random() * 10,
              );
              const number_of_people_aged_65_and_over = Math.floor(
                Math.random() * 10,
              );
              const number_of_people_in_household =
                number_of_people_under_15_years_old +
                number_of_people_aged_15_to_64 +
                number_of_people_aged_65_and_over;
              const composition_ratio_of_people_aged_15_to_64 =
                (number_of_people_aged_15_to_64 /
                  number_of_people_in_household) *
                100;
              const composition_ratio_of_people_aged_65_and_over =
                (number_of_people_aged_65_and_over /
                  number_of_people_in_household) *
                100;
              const composition_ratio_of_people_under_15_years_old =
                (number_of_people_under_15_years_old /
                  number_of_people_in_household) *
                100;
              const number_of_male = Math.floor(
                Math.random() * number_of_people_in_household,
              );
              const number_of_female =
                number_of_people_in_household - number_of_male;
              const male_to_female_ratio = number_of_male / number_of_female;
              const pred = Math.random();

              const area_group =
                TOYOTA_AREAS[Math.floor(Math.random() * TOYOTA_AREAS.length)];
              const insertion: typeof data_set_detail_buildings.$inferInsert = {
                reference_date,
                data_set_result_id: res[0].id,
                household_code: `1000000${i}`,
                area_group,
                normalized_address: `愛知県豊田市${area_group}${i}丁目`,
                household_size: number_of_people_in_household,
                members_under_15: number_of_people_under_15_years_old,
                percentage_under_15:
                  composition_ratio_of_people_under_15_years_old,
                members_15_to_64: number_of_people_aged_15_to_64,
                percentage_15_to_64: composition_ratio_of_people_aged_15_to_64,
                members_over_65: number_of_people_aged_65_and_over,
                percentage_over_65:
                  composition_ratio_of_people_aged_65_and_over,
                gender_ratio: male_to_female_ratio,
                residence_duration: Math.floor(Math.random() * 10),
                water_supply_number: `1000000${i}`,
                water_disconnection_flag: Math.round(Math.random()),
                max_water_usage: Math.floor(Math.random() * 100),
                avg_water_usage: Math.floor(Math.random() * 100),
                total_water_usage: Math.floor(Math.random() * 100),
                min_water_usage: Math.floor(Math.random() * 100),
                water_supply_source_info: `水道局${i}`,
                structure_name: `建物${i}`,
                registration_date: reference_date,
                registration_source_info: `登記所${i}`,
                vacant_house_id: `1000000${i}`,
                vacant_house_address: `愛知県豊田市${area_group}${i}丁目`,
                gml_id: `1000000${i}`,
                measuredheight: Math.floor(Math.random() * 100),
                rank: Math.floor(Math.random() * 100),
                depth: Math.floor(Math.random() * 100),
                duration: Math.floor(Math.random() * 100),
                floors_above_ground: Math.floor(Math.random() * 100),
                floors_below_ground: Math.floor(Math.random() * 100),
                inland_flooding_risk_desc: `内水氾濫リスク${i}`,
                inland_flooding_risk_rank: Math.floor(Math.random() * 100),
                inland_flooding_risk_depth: Math.floor(Math.random() * 100),
                river_flooding_risk_desc: `河川氾濫リスク${i}`,
                river_flooding_risk_rank: Math.floor(Math.random() * 100),
                river_flooding_risk_depth: Math.floor(Math.random() * 100),
                landslide_risk_desc: `地滑りリスク${i}`,
                name: `建物名${i}`,
                predicted_label: Math.round(pred),
                predicted_probability: pred * 100,
                geometry:
                  feature.geometry.type === "Polygon"
                    ? JSON.stringify(feature.geometry.coordinates) // 多重配列はsqliteに入らないので文字列に変換する
                    : "",
              };
              await tx.insert(data_set_detail_buildings).values(insertion);
              await new Promise((resolve) => setTimeout(resolve, 10));
            }),
          );

          const processedBuildings =
            features.length < chunkSize
              ? totalBuildings
              : features.length * (chunkIndex + 1);

          const progress = (processedBuildings / totalBuildings) * 100;
          console.info(
            `Year ${year}: Processed ${processedBuildings}/${totalBuildings} buildings (${progress.toFixed(2)}%)`,
          );
        }

        console.info(`Completed data insertion for year ${year}`);
      }
    });

    console.info("Dummy data set results created🎉");
  } catch (error) {
    console.error("Failed to create dummy data set results", error);
  }
}) satisfies IpcMainListener;
