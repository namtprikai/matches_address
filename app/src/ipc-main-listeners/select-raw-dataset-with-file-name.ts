import { eq } from "drizzle-orm";
import { raw_data_sets, type SelectRawDataSet } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectRawDatasetWithFileName = (async (
  _: unknown,
  { fileName }: { fileName: SelectRawDataSet["file_name"] },
): Promise<SelectRawDataSet | undefined> => {
  const data = await db
    .select()
    .from(raw_data_sets)
    .where(eq(raw_data_sets.file_name, fileName))
    .get();

  return data;
}) satisfies IpcMainListener;
