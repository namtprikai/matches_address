import { sql } from "drizzle-orm";
import { workbooks } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type Workbook = typeof workbooks.$inferSelect;

export const selectWorkbook: IpcMainListener = (
  _: unknown,
  { id }: { id: number },
): Workbook | undefined => {
  const data = db
    .select()
    .from(workbooks)
    .where(sql`${workbooks.id} = ${id}`)
    .get();

  return data;
};
