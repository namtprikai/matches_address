import { workbooks } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

type Workbook = typeof workbooks.$inferSelect;

export const selectWorkbooks = ((): Workbook[] => {
  const all = db.select().from(workbooks).all();

  return all;
}) satisfies IpcMainListener;
