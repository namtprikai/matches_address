import { eq } from "drizzle-orm";
import { result_views, type SelectResultView } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectResultView = (async (
  _: unknown,
  { resultViewId }: { resultViewId: number },
): Promise<SelectResultView | undefined> => {
  const data = await db
    .select()
    .from(result_views)
    .where(eq(result_views.id, resultViewId))
    .get();

  return data;
}) satisfies IpcMainListener;
