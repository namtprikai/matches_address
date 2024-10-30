import { count, eq } from "drizzle-orm";
import {
  data_set_detail_buildings,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export type SelectBuildingsWithPaginationReturnType = ReturnType<
  typeof selectBuildingsWithPagination
>;

export const selectBuildingsWithPagination = (async (
  _: unknown,
  {
    id,
    page,
    limitPerPage,
  }: {
    id: SelectDataSetDetailBuilding["id"];
    page: number;
    limitPerPage: number;
  },
): Promise<{
  items: SelectDataSetDetailBuilding[];
  total: number;
  totalPages: number;
}> => {
  const totalCountResult = await db
    .select({ count: count() })
    .from(data_set_detail_buildings);
  const total = totalCountResult[0].count;
  const offset = (page - 1) * limitPerPage;

  const items = await db
    .select()
    .from(data_set_detail_buildings)
    .where(eq(data_set_detail_buildings.id, id))
    .limit(limitPerPage)
    .offset(offset);

  return {
    items,
    total,
    totalPages: Math.ceil(total / limitPerPage),
  };
}) satisfies IpcMainListener;
