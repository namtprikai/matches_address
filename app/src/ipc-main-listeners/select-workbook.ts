import { sql } from 'drizzle-orm'
import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

export const selectWorkbook: IpcMainListener = (_: unknown, {id}: {id: number}): {
  // これschemaから生成できないのか気になる
  id: number;
  title: string | null;
  created_at: string | null;
} | undefined  => {
  const data = db.select().from(workbooks).where(sql`${workbooks.id} = ${id}`).get();

  return data;
};
