import { eq } from "drizzle-orm";
import { normalized_data_sets, type SelectNormalizedDataSet } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectNormalizedDatasetWithFileName = (async (
  _: unknown,
  { fileName }: { fileName: SelectNormalizedDataSet["file_name"] },
): Promise<SelectNormalizedDataSet | undefined> => {
  if (!fileName) return undefined;

  const data = await db
    .select()
    .from(normalized_data_sets)
    .where(eq(normalized_data_sets.file_name, fileName))
    .get();

  return data;
}) satisfies IpcMainListener;
