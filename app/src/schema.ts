import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
});

export const workbooks = sqliteTable("workbooks", {
  id: integer("id").primaryKey(),
  title: text("title"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const result_sheets = sqliteTable("result_sheets", {
  id: integer("id").primaryKey(),
  workbook_id: integer("workbook_id"),
  title: text("title"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const result_views = sqliteTable("result_views", {
  id: integer("id").primaryKey(),
  sheet_id: integer("sheet_id"),
  data_set_result_id: integer("data_set_result_id"),

  title: text("title"),
  unit: text("unit", { enum: ["building", "area"] }),
  style: text("style", { enum: ["map", "bar", "line", "pie"] }),

  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const data_set_results = sqliteTable("data_set_results", {
  id: integer("id").primaryKey(),
  title: text("title"),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
