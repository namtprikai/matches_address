import { eq } from "drizzle-orm";
import {
  data_set_detail_buildings,
  type SelectDataSetResult,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const fetchReferenceDates = ((
  _: unknown,
  { dataSetResultId }: { dataSetResultId: SelectDataSetResult["id"] },
): SelectDataSetDetailBuilding["reference_date"][] => {
  const result = db
    .selectDistinct({
      reference_date: data_set_detail_buildings.reference_date,
    })
    .from(data_set_detail_buildings)
    .where(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId))
    .all();

  return result.map((r) => r.reference_date);
}) satisfies IpcMainListener;
