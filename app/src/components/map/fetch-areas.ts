import { and, eq, gt } from "drizzle-orm";
import { type IpcMainListener } from "../../ipc-main-listeners";
import {
  data_set_detail_areas,
  type SelectDataSetDetailArea,
} from "../../schema";
import { db } from "../../utils/db";

export const fetchAreasInBatches = ((
  _: unknown,
  {
    dataSetResultId,
    referenceDate,
    batchSize,
    lastId,
  }: {
    dataSetResultId: number;
    referenceDate: string | undefined;
    batchSize: number;
    lastId?: number;
  },
): SelectDataSetDetailArea[] | null => {
  try {
    const result = db
      .select()
      .from(data_set_detail_areas)
      .where(
        and(
          eq(data_set_detail_areas.data_set_result_id, dataSetResultId),
          referenceDate
            ? eq(data_set_detail_areas.reference_date, referenceDate)
            : undefined,
          lastId ? gt(data_set_detail_areas.id, lastId) : undefined,
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
