import { db } from "../utils/db";
import { raw_data_sets, type SelectRawDataSet } from "../schema";
import { type IpcMainListener } from ".";

export const fetchRawDatasets = (async (): Promise<SelectRawDataSet[]> => {
  const result = await db.select().from(raw_data_sets);
  return result;
}) satisfies IpcMainListener;
