import { sql } from "drizzle-orm";
import { result_views } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type ResultViews = typeof result_views.$inferSelect;

export const selectResultViews = ((
  _: unknown,
  { sheetId }: { sheetId: number },
): ResultViews[] => {
  const all = db
    .select()
    .from(result_views)
    .where(sql`${result_views.sheet_id} = ${sheetId}`)
    .all();

  return all;
}) satisfies IpcMainListener;
