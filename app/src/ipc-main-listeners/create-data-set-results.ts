import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type InsertDataSetResult = typeof data_set_results.$inferInsert;

/** 開発用・実際にはアプリケーションからインサートすることはない */
export const createDataSetResults = (async (
  _: unknown,
  { title }: InsertDataSetResult,
): Promise<void> => {
  await db.transaction(async (tx) => {
    const res = await tx.insert(data_set_results).values({ title }).returning();
    await tx
      .insert(data_set_detail_areas)
      .values({ data_set_result_id: res[0].id });

    for (let i = 0; i < 5; i++) {

      const number_of_people_under_15_years_old = Math.floor(Math.random() * 10);
      const number_of_people_aged_15_to_64 = Math.floor(Math.random() * 10);
      const number_of_people_aged_65_and_over = Math.floor(Math.random() * 10);
      const number_of_people_in_household = number_of_people_under_15_years_old + number_of_people_aged_15_to_64 + number_of_people_aged_65_and_over;
      const composition_ratio_of_people_aged_15_to_64 = number_of_people_aged_15_to_64 / number_of_people_in_household;
      const composition_ratio_of_people_aged_65_and_over = number_of_people_aged_65_and_over / number_of_people_in_household;
      const composition_ratio_of_people_under_15_years_old = number_of_people_under_15_years_old / number_of_people_in_household
      const number_of_male = Math.floor(Math.random() * number_of_people_in_household);
      const number_of_female = number_of_people_in_household - number_of_male;
      const male_to_female_ratio = number_of_male / number_of_female;

      const insertion: typeof data_set_detail_buildings.$inferInsert = {
        data_set_result_id: res[0].id,
        household_code: `1000000${i}`,
        normalized_address: `東京都港区六本木${i}丁目`,
        number_of_people_in_household,
        number_of_people_under_15_years_old,
        composition_ratio_of_people_under_15_years_old,
        number_of_people_aged_15_to_64,
        composition_ratio_of_people_aged_15_to_64,
        number_of_people_aged_65_and_over,
        composition_ratio_of_people_aged_65_and_over,
        male_to_female_ratio,
        period_of_residence: Math.floor(Math.random() * 48),
        water_number_suido_residence: `1000000${i}`,
        closing_flag_suido_residence: Math.floor(Math.random()),
        maximum_water_usage_suido_residence: Math.floor(Math.random() * 100),
        average_water_usage_suido_residence: Math.floor(Math.random() * 100),
        total_water_usage_suido_residence: Math.floor(Math.random() * 100),
        minimum_water_usage_suido_residence: Math.floor(Math.random() * 100),
        name_source_information_suido_residence: `東京都港区六本木${i}丁目`,
        structure_name_touki_residence: `東京都港区六本木${i}丁目`,
        registration_date_touki_residence: `2021-01-01`,
        name_source_information_touki_residence: `東京都港区六本木${i}丁目`,
        id_akiya_result_cleaned: `1000000${i}`,
        address_akiya_result_cleaned: `東京都港区六本木${i}丁目`,
        geometry: `POINT(139.7310${i} 35.6585${i})`,
        measuredheight: Math.random() * 100,
        rank: Math.floor(Math.random() * 10),
        depth: Math.random() * 10,
        duration: Math.random() * 10,
        number_of_floors_above_ground: Math.floor(Math.random() * 10),
        number_of_basement_floors: Math.floor(Math.random() * 5),
        name: `東京都港区六本木${i}丁目`,
        pred: Math.floor(Math.random()),
        pred_proba: Math.random(),
      }

      await tx
        .insert(data_set_detail_buildings)
        .values(insertion);
    }
  });
}) satisfies IpcMainListener;
