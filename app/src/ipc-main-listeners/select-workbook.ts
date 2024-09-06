import { sql } from "drizzle-orm";
import { type SelectWorkbook, workbooks } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectWorkbook = ((
  _: unknown,
  { id }: { id: number },
): SelectWorkbook | undefined => {
  const data = db
    .select()
    .from(workbooks)
    .where(sql`${workbooks.id} = ${id}`)
    .get();

  return data;
}) satisfies IpcMainListener;
