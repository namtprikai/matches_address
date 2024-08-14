import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
});

export const workbooks = sqliteTable("workbooks", {
  id: integer("id").primaryKey(),
  title: text("title"),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const result_sheets = sqliteTable("result_sheets", {
  id: integer("id").primaryKey(),
  workbook_id: integer("workbook_id"),
  title: text("title"),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const result_views = sqliteTable("result_views", {
  id: integer("id").primaryKey(),
  sheet_id: integer("sheet_id"),
  data_set_result_id: integer("data_set_result_id"),

  title: text("title"),
  unit: text("unit", { enum: ["building", "area"] }),
  style: text("style", { enum: ["map", "bar", "line", "pie", "table"] }),

  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const data_set_results = sqliteTable("data_set_results", {
  id: integer("id").primaryKey(),
  title: text("title"),
  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const data_set_detail_buildings = sqliteTable(
  "data_set_detail_buildings",
  {
    id: integer("id").primaryKey(),
    data_set_result_id: integer("data_set_result_id"),

    household_code: text("household_code"),
    normalized_address: text("normalized_address"),

    number_of_people_in_household: integer("number_of_people_in_household"),
    number_of_people_under_15_years_old: integer("number_of_people_under_15_years_old"),
    /**
    * 15歳未満の世帯に対する人数比
    * 
    * 0~1の小数で表現（8byte 浮動小数点）
    */
    composition_ratio_of_people_under_15_years_old: real("composition_ratio_of_people_under_15_years_old"),
    number_of_people_aged_15_to_64: integer("number_of_people_aged_15_to_64"),
    /**
     * 15歳以上64歳以下の世帯に対する人数比
     * 
     * 0~1の小数で表現（8byte 浮動小数点）
     */
    composition_ratio_of_people_aged_15_to_64: real("composition_ratio_of_people_aged_15_to_64"),
    number_of_people_aged_65_and_over: integer("number_of_people_aged_65_and_over"),
    /**
     * 65歳以上の世帯に対する人数比
     * 
     * 0~1の小数で表現（8byte 浮動小数点）
     */
    composition_ratio_of_people_aged_65_and_over: real("composition_ratio_of_people_aged_65_and_over"),
    /**
     * 男女比
     * 
     * 世帯の男性人数 / 世帯の女性人数 = 0~1の男女比（8byte 浮動小数点）
     */
    male_to_female_ratio: real("male_to_female_ratio"),

    /**
     *  住定期間
     * 
     *  整数：住定期間（年）
     */
    period_of_residence: integer("period_of_residence"),
    /**
     * 水道番号
     * 
     * 文字列：任意の文字列
     */
    water_number_suido_residence: text("water_number_suido_residence"),
    /**
     * 閉栓フラグ
     * 
     * 1: 閉栓 / 0: 開栓
     */
    closing_flag_suido_residence: integer("closing_flag_suido_residence"), // SQLiteにはbool型がないため、0,1で表現する
    /**
     * 最大水道使用量
     * 
     * 単位：m^3
     * 小数で表現（8byte 浮動小数点）
     */
    maximum_water_usage_suido_residence: real("maximum_water_usage_suido_residence"),
    /**
     * 平均水道使用量
     * 
     * 単位：m^3
     * 小数で表現（8byte 浮動小数点）
     */
    average_water_usage_suido_residence: real("average_water_usage_suido_residence"),
    /**
     * 合計水道使用量
     * 
     * 単位：m^3
     * 小数で表現（8byte 浮動小数点）
     */
    total_water_usage_suido_residence: real("total_water_usage_suido_residence"),
    /**
     * 最小水道使用量
     * 
     * 単位：m^3
     * 小数で表現（8byte 浮動小数点）
     */
    minimum_water_usage_suido_residence: real("minimum_water_usage_suido_residence"),

    /**
     * 名寄せ元情報_水道
     * 
     * 文字列：任意の文字列
     */
    name_source_information_suido_residence: text("name_source_information_suido_residence"),

    /**
     * 登記上の構造名称
     * 
     * 文字列：任意の文字列
     */
    structure_name_touki_residence: text("structure_name_touki_residence"),
    /**
     * 登記年月日
     * 
     * YYYY-MM-DD形式の文字列
     */
    registration_date_touki_residence: text("registration_date_touki_residence"),
    /**
     * 名寄せ元情報_住基
     * 
     * 文字列：任意の文字列
     */
    name_source_information_touki_residence: text("name_source_information_touki_residence"),
    /**
     * ID_空き家結果_データクレンジング済
     * 
     * 文字列：任意の文字列
     */
    id_akiya_result_cleaned: text("id_akiya_result_cleaned"),
    /**
     * 住所_空き家結果_データクレンジング済
     * 
     * 文字列：任意の文字列
     */
    address_akiya_result_cleaned: text("address_akiya_result_cleaned"),

    /**
     * ジオメトリデータ
     * 
     * 文字列：任意の文字列
     */
    geometry: text("geometry"),

    /**
     * 標高
     * 
     * 単位：m
     * 小数で表現
     */
    measuredheight: real("measuredheight"),
    /**
     * 洪水浸水ランク
     * 
     * 整数
     */
    rank: integer("rank"),
    /**
     * 洪水浸水深
     * 
     * 単位：m
     * 整数
     */
    depth: integer("depth"),
    /**
     * 洪水浸水時間
     * 
     * 単位：h
     * 文字列：小数で表現
     */
    duration: real("duration"),
    /**
     * 地上階数
     * 
     * 整数
     */
    number_of_floors_above_ground: integer("number_of_floors_above_ground"),
    /**
     * 地下階数
     * 
     * 整数
     */
    number_of_basement_floors: integer("number_of_basement_floors"),
    /**
     * 洪水浸水リスク属性_建物
     * 
     * 文字列：任意の文字列
     */
    buildingdisasterriskattribute_buildinginlandfloodingriskattribute_description: text("buildingdisasterriskattribute_buildinginlandfloodingriskattribute_description"),
    /**
     * 洪水浸水リスク属性_ランク
     * 
     * 整数
     */
    buildingdisasterriskattribute_buildinginlandfloodingriskattribute_rank: integer("buildingdisasterriskattribute_buildinginlandfloodingriskattribute_rank"),
    /**
     * 洪水浸水リスク属性_浸水深
     * 
     * 単位：m
     * 小数で表現
     */
    buildingdisasterriskattribute_buildinginlandfloodingriskattribute_depth: real("buildingdisasterriskattribute_buildinginlandfloodingriskattribute_depth"),
    /**
     * 洪水氾濫リスク属性_建物
     * 
     * 文字列：任意の文字列
     */
    buildingdisasterriskattribute_buildingriverfloodingriskattribute_description: text("buildingdisasterriskattribute_buildingriverfloodingriskattribute_description"),
    /**
     * 洪水氾濫リスク属性_ランク
     * 
     * 整数
     */
    buildingdisasterriskattribute_buildingriverfloodingriskattribute_rank: integer("buildingdisasterriskattribute_buildingriverfloodingriskattribute_rank"),
    /**
     * 洪水氾濫リスク属性_氾濫深長
     * 
     * 単位：m
     * 小数で表現
     */
    buildingdisasterriskattribute_buildingriverfloodingriskattribute_depth: real("buildingdisasterriskattribute_buildingriverfloodingriskattribute_depth"),
    /**
     * 地滑りリスク属性_建物
     * 
     * 文字列：任意の文字列
     */
    buildingdisasterriskattribute_buildinglandslideriskattribute_description: text("buildingdisasterriskattribute_buildinglandslideriskattribute_description"),
    /**
     * 建物名
     * 
     * 文字列：任意の文字列
     */
    name: text("name"),
    /**
     * 空き家確率
     * 
     * 1: 空き家 / 0: 居住
     */
    pred: integer("pred"),
    /**
     * 空き家確率
     * 
     * 0~1の小数で表現（8byte 浮動小数点）
     */
    pred_proba: real("pred_proba"),


    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull()
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
);

export const data_set_detail_areas = sqliteTable("data_set_detail_areas", {
  id: integer("id").primaryKey(),
  data_set_result_id: integer("data_set_result_id"),

  created_at: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updated_at: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
