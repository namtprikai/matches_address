import { eq } from "drizzle-orm";
import { result_views } from "../schema";
import { db } from "../utils/db";
import { type MapCenter } from "../bi-modules/interfaces/parameter";
import { type IpcMainListener } from ".";

type Params = {
  resultViewId: number;
  mapCenter: MapCenter;
};
export const updateMapCenter = (async (
  _: unknown,
  { mapCenter, resultViewId }: Params,
): Promise<void> => {
  const res = db
    .select({
      parameters: result_views.parameters,
    })
    .from(result_views)
    .where(eq(result_views.id, resultViewId))
    .get();

  if (!res) {
    throw new Error(`Result view with ID ${resultViewId} not found.`);
  }

  const currentParameters = res.parameters.filter(
    (param) => param.key !== "map_center",
  );

  await db
    .update(result_views)
    .set({ parameters: [...currentParameters, mapCenter] })
    .where(eq(result_views.id, resultViewId));
}) satisfies IpcMainListener;
