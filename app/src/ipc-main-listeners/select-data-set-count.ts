import { and, count, eq } from "drizzle-orm";
import { data_set_detail_areas, data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { type View } from "../bi-modules/interfaces/view";
import { type IpcMainListener } from ".";

export const selectDataSetCount = (async (
  _: unknown,
  {
    dataSetResultId,
    unit,
  }: {
    dataSetResultId: View["dataSetResultId"];
    unit: View["unit"];
  },
): Promise<{ count: number }> => {
  try {
    const countQuery = db.select({ count: count() });

    switch (unit) {
      case "building": {
        const allCount = await countQuery
          .from(data_set_detail_buildings)
          .where(
            and(
              eq(data_set_detail_buildings.data_set_result_id, dataSetResultId),
            ),
          );
        return {
          count: allCount[0].count,
        };
      }
      case "area": {
        const allCount = await countQuery
          .from(data_set_detail_areas)
          .where(
            and(eq(data_set_detail_areas.data_set_result_id, dataSetResultId)),
          );
        return {
          count: allCount[0].count,
        };
      }
    }
  } catch (error) {
    console.error("Error in selectDataSetCount:", error);
    throw new Error("Failed to fetch data set count");
  }
}) satisfies IpcMainListener;
