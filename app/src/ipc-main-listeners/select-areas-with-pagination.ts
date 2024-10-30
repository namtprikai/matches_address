import { count, eq } from "drizzle-orm";
import { data_set_detail_areas, type SelectDataSetDetailArea } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export type SelectAreasWithPaginationReturnType = ReturnType<
  typeof selectAreasWithPagination
>;

export const selectAreasWithPagination = (async (
  _: unknown,
  {
    id,
    page,
    limitPerPage,
  }: {
    id: SelectDataSetDetailArea["id"];
    page: number;
    limitPerPage: number;
  },
): Promise<{
  items: SelectDataSetDetailArea[];
  total: number;
  totalPages: number;
}> => {
  const totalCountResult = await db
    .select({ count: count() })
    .from(data_set_detail_areas);
  const total = totalCountResult[0].count;
  const offset = (page - 1) * limitPerPage;

  const items = await db
    .select()
    .from(data_set_detail_areas)
    .where(eq(data_set_detail_areas.id, id))
    .limit(limitPerPage)
    .offset(offset);

  return {
    items,
    total,
    totalPages: Math.ceil(total / limitPerPage),
  };
}) satisfies IpcMainListener;
