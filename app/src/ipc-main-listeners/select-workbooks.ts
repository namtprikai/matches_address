import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

type Workbook = typeof workbooks.$inferSelect;

export const selectWorkbooks: IpcMainListener = (): Workbook[] => {
  const all = db.select().from(workbooks).all();

  return all;
};
