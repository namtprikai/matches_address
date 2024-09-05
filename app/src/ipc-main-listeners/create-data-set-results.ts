import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
  type InsertDataSetDetailBuilding,
  type InsertDataSetResult,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

/** 開発用・実際にはアプリケーションからインサートすることはない */
export const createDataSetResults = (async (
  _: unknown,
  { title }: InsertDataSetResult,
): Promise<void> => {
  await db.transaction(async (tx) => {
    const res = await tx.insert(data_set_results).values({ title }).returning();
    await tx.insert(data_set_detail_areas).values({
      data_set_result_id: res[0].id,
      reference_date: "2021-01-01 12:00:00",
    });

    /** 開発用のテストデータ生成ロジック、本番環境では利用しない  */
    for (let i = 0; i < 5; i++) {
      const number_of_people_under_15_years_old = Math.floor(
        Math.random() * 10,
      );
      const number_of_people_aged_15_to_64 = Math.floor(Math.random() * 10);
      const number_of_people_aged_65_and_over = Math.floor(Math.random() * 10);
      const number_of_people_in_household =
        number_of_people_under_15_years_old +
        number_of_people_aged_15_to_64 +
        number_of_people_aged_65_and_over;
      const composition_ratio_of_people_aged_15_to_64 =
        number_of_people_aged_15_to_64 / number_of_people_in_household;
      const composition_ratio_of_people_aged_65_and_over =
        number_of_people_aged_65_and_over / number_of_people_in_household;
      const composition_ratio_of_people_under_15_years_old =
        number_of_people_under_15_years_old / number_of_people_in_household;
      const number_of_male = Math.floor(
        Math.random() * number_of_people_in_household,
      );
      const number_of_female = number_of_people_in_household - number_of_male;
      const male_to_female_ratio = number_of_male / number_of_female;

      const pred = Math.random();

      const insertion: InsertDataSetDetailBuilding = {
        data_set_result_id: res[0].id,
        household_code: `1000000${i}`,
        normalized_address: `東京都港区六本木${i}丁目`,
        reference_date: `202${i}-01-01`,
        household_size: number_of_people_in_household,
        members_under_15: number_of_people_under_15_years_old,
        percentage_under_15: composition_ratio_of_people_under_15_years_old,
        members_15_to_64: number_of_people_aged_15_to_64,
        percentage_15_to_64: composition_ratio_of_people_aged_15_to_64,
        members_over_65: number_of_people_aged_65_and_over,
        percentage_over_65: composition_ratio_of_people_aged_65_and_over,
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
        registration_date: `202${i}-01-01`,
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
      };

      await tx.insert(data_set_detail_buildings).values(insertion);
    }
  });
}) satisfies IpcMainListener;
