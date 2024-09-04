import { type IpcMainListener } from "../../ipc-main-listeners";
import { data_set_detail_buildings } from "../../schema";
import { db } from "../../utils/db";

export const fetchReferenceYears = ((
  _: unknown,
): (typeof data_set_detail_buildings.$inferSelect)["reference_date"][] => {
  const result = db
    .selectDistinct({
      reference_date: data_set_detail_buildings.reference_date,
    })
    .from(data_set_detail_buildings)
    .all();

  return result.map((r) => r.reference_date);
}) satisfies IpcMainListener;
