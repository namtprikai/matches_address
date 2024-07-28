import { sql } from 'drizzle-orm'
import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

type Workbook = typeof workbooks.$inferSelect;

export const selectWorkbook: IpcMainListener = (_: unknown, {id}: {id: number}): Workbook | undefined  => {
  const data = db.select().from(workbooks).where(sql`${workbooks.id} = ${id}`).get();

  return data;
};
