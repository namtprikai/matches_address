import { eq, sql } from "drizzle-orm";
import {
  result_views,
  data_set_results,
  data_set_detail_buildings,
  data_set_detail_areas,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;
type DataSetsDetailBuildings = typeof data_set_detail_buildings.$inferSelect;
type DataSetsDetailAreas = typeof data_set_detail_areas.$inferSelect;

export type ReadResultViewsResponse = {
  result_views: ResultViews;
  data_set_results: DataSetResults;
  data_set_detail_buildings: DataSetsDetailBuildings | null;
  data_set_detail_areas: DataSetsDetailAreas | null;
}[];

export const readResultViews = ((
  _: unknown,
  { sheetId }: { sheetId: number },
): ReadResultViewsResponse => {
  const all = db
    .select()
    .from(result_views)
    .where(sql`${result_views.sheet_id} = ${sheetId}`)
    .innerJoin(
      data_set_results,
      eq(data_set_results.id, result_views.data_set_result_id),
    )
    .leftJoin(
      data_set_detail_buildings,
      eq(data_set_results.id, data_set_detail_buildings.data_set_result_id),
    )
    .leftJoin(
      data_set_detail_areas,
      eq(data_set_results.id, data_set_detail_areas.data_set_result_id),
    )
    .all();

  return all;
}) satisfies IpcMainListener;
