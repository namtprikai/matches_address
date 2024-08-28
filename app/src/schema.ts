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
    created_at: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updated_at: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull()
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),

    // properties
    householdSize: integer("household_size"),
    membersUnder15: integer("members_under_15"),
    percentageUnder15: real("percentage_under_15"),
    members15To64: integer("members_15_to_64"),
    percentage15To64: real("percentage_15_to_64"),
    membersOver65: integer("members_over_65"),
    percentageOver65: real("percentage_over_65"),
    genderRatio: real("gender_ratio"),
    residenceDuration: integer("residence_duration"),
    waterDisconnectionFlag: integer("water_disconnection_flag"),
    maxWaterUsage: integer("max_water_usage"),
    structureName: integer("structure_name"),
    registrationDate: text("registration_date"),
    hasVacantResult: integer("has_vacant_result"),
    predictedLabel: integer("predicted_label"),
    predictedProbability: real("predicted_probability"),

    // geometry
    type: text("type"),
    coordinates: text("coordinates"), // JSON.stringify() したものを格納する
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
