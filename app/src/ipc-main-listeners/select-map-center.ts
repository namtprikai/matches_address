import { eq } from "drizzle-orm";
import { result_views } from "../schema";
import { db } from "../utils/db";
import { type MapCenter } from "../bi-modules/interfaces/parameter";
import { type IpcMainListener } from ".";

type Params = {
  resultViewId: number;
};

type Return = {
  mapCenter: MapCenter | undefined;
};

export const selectMapCenter = (async (
  _: unknown,
  { resultViewId }: Params,
): Promise<Return> => {
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

  const currentMapCenterParameter = res.parameters.find(
    (param) => param.key === "map_center",
  );

  return { mapCenter: currentMapCenterParameter };
}) satisfies IpcMainListener;
