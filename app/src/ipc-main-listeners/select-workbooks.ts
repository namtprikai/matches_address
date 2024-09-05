import { type SelectWorkbook, workbooks } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export const selectWorkbooks = ((): SelectWorkbook[] => {
  const all = db.select().from(workbooks).all();

  return all;
}) satisfies IpcMainListener;
