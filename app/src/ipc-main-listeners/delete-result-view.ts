import { eq } from "drizzle-orm";
import { result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const deleteResultView = (async (
  _: unknown,
  { resultViewId }: { resultViewId: number },
): Promise<void> => {
  await db.delete(result_views).where(eq(result_views.id, resultViewId));
}) satisfies IpcMainListener;
