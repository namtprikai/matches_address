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
    await tx
      .insert(data_set_detail_buildings)
      .values({ data_set_result_id: res[0].id });
  });
}) satisfies IpcMainListener;
