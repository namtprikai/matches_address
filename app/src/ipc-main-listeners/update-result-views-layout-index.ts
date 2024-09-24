import { eq } from "drizzle-orm";
import { result_views, type SelectResultView } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type Params = {
  resultViewId: number;
  value: {
    layoutIndex: number;
  };
};

export const updateResultViewsLayoutIndex = (async (
  _: unknown,
  { resultViewId, value: { layoutIndex } }: Params,
): Promise<SelectResultView[]> => {
  const res = await db
    .update(result_views)
    .set({ layoutIndex })
    .where(eq(result_views.id, resultViewId))
    .returning();
  return res;
}) satisfies IpcMainListener;
