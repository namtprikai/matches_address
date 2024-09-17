import { eq } from "drizzle-orm";
import { result_views, type SelectResultView } from "../schema";
import { db } from "../utils/db";
import { type Parameter } from "../@types/charts";
import { type IpcMainListener } from ".";

export type SelectResultViewResponse = SelectResultView & {
  parameters: Parameter[];
};

export const selectResultView = (async (
  _: unknown,
  { resultViewId }: { resultViewId: number },
): Promise<SelectResultViewResponse | undefined> => {
  const data = await db
    .select()
    .from(result_views)
    .where(eq(result_views.id, resultViewId))
    .get();

  return data as SelectResultViewResponse;
}) satisfies IpcMainListener;
