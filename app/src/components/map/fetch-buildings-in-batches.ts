import { and, eq, gt } from "drizzle-orm";
import { type IpcMainListener } from "../../ipc-main-listeners";
import { data_set_detail_buildings } from "../../schema";
import { db } from "../../utils/db";

export const fetchBuildingsInBatches = ((
  _: unknown,
  {
    dataSetResultsId,
    batchSize,
    lastId,
  }: { dataSetResultsId: number; batchSize: number; lastId?: number },
): (typeof data_set_detail_buildings.$inferSelect)[] | null => {
  try {
    const result = db
      .select()
      .from(data_set_detail_buildings)
      .where(
        and(
          eq(data_set_detail_buildings.data_set_result_id, dataSetResultsId),
          lastId ? gt(data_set_detail_buildings.id, lastId) : undefined,
        ),
      )
      .limit(batchSize)
      .all();
    return result;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return null;
  }
}) satisfies IpcMainListener;
