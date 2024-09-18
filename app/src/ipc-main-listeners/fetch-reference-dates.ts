import { eq } from "drizzle-orm";
import { data_set_detail_buildings, type SelectDataSetResult } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const fetchReferenceDates = ((
  _: unknown,
  { dataSetResultId }: { dataSetResultId: SelectDataSetResult["id"] },
): string[] => {
  const result = db
    .selectDistinct({
      reference_date: data_set_detail_buildings.reference_date,
    })
    .from(data_set_detail_buildings)
    .where(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId))
    .all();

  return Array.from(
    new Set(
      result.map((r) => new Date(r.reference_date).getFullYear().toString()),
    ),
  );
}) satisfies IpcMainListener;
