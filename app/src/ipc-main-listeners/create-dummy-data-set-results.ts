import { readFileSync } from "fs";
import path from "path";
import { type FeatureCollection } from "geojson";
import {
  data_set_results,
  data_set_detail_areas,
  data_set_detail_buildings,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

// 開発用
export const createDummyDataSetResults = (async (
  _: unknown,
  { full = false }: { full: boolean },
): Promise<Promise<void>> => {
  try {
    // すでにデータがある場合はテーブルの内容を削除してリセットする
    const result = await db.select().from(data_set_results);
    if (result.length > 0) {
      await db.delete(data_set_results);
      await db.delete(data_set_detail_areas);
      await db.delete(data_set_detail_buildings);
    }

    console.info("Creating dummy data set results...");

    // 建物データをJSONファイルから取得する
    const d902 = Array.from({ length: full ? 10 : 1 }, (_, i) => i + 1).map(
      (i) => {
        const filePath = path.resolve(`./public/D902/${i}.json`);
        const rawData = readFileSync(filePath);
        const jsonData: FeatureCollection = JSON.parse(rawData.toString());
        return jsonData;
      },
    );
    // feature = 建物データ
    const features = d902.flatMap((f) => f.features);
    const chunkSize = 5000;
    const chunkedFeatures = Array.from(
      { length: Math.ceil(features.length / chunkSize) },
      (_, i) => features.slice(i * chunkSize, i * chunkSize + chunkSize),
    );

    await db.transaction(async (tx) => {
      for (const year of [2019, 2020, 2021, 2022, 2023]) {
        const reference_date = `${year}-04-02`;
        const res = await tx
          .insert(data_set_results)
          .values({ title: `分析結果${year}` })
          .returning();
        const data_set_result_id = res[0].id;

        await tx.insert(data_set_detail_areas).values({
          data_set_result_id,
          reference_date,
        });

        const totalBuildings = chunkedFeatures.flat().length;
        console.info(
          `Starting data insertion for year ${year}. Total buildings: ${totalBuildings}`,
        );

        for (
          let chunkIndex = 0;
          chunkIndex < chunkedFeatures.length;
          chunkIndex++
        ) {
          const features = chunkedFeatures[chunkIndex];

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
                number_of_people_aged_15_to_64 / number_of_people_in_household;
              const composition_ratio_of_people_aged_65_and_over =
                number_of_people_aged_65_and_over /
                number_of_people_in_household;
              const composition_ratio_of_people_under_15_years_old =
                number_of_people_under_15_years_old /
                number_of_people_in_household;
              const number_of_male = Math.floor(
                Math.random() * number_of_people_in_household,
              );
              const number_of_female =
                number_of_people_in_household - number_of_male;
              const male_to_female_ratio = number_of_male / number_of_female;
              const pred = Math.random();

              const insertion: typeof data_set_detail_buildings.$inferInsert = {
                reference_date,
                data_set_result_id: res[0].id,
                household_code: `1000000${i}`,
                normalized_address: `東京都港区六本木${i}丁目`,
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
                vacant_house_address: `東京都港区六本木${i}丁目`,
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
                predicted_probability: pred,
                geometry:
                  feature.geometry.type === "Polygon"
                    ? JSON.stringify(feature.geometry.coordinates) // 多重配列はsqliteに入らないので文字列に変換する
                    : "",
              };
              await tx.insert(data_set_detail_buildings).values(insertion);
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
