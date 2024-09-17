import { type SelectWorkbook, workbooks } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectWorkbooks = (async (): Promise<SelectWorkbook[]> => {
  const all = await db.select().from(workbooks).all();

  return all;
}) satisfies IpcMainListener;
