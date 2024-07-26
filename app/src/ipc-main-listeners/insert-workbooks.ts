import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

export const insertWorkbooks: IpcMainListener = (_: unknown, {title}: {title: string}): void => {
  console.log({title})
  void db.insert(workbooks).values({ title }).run();
};
