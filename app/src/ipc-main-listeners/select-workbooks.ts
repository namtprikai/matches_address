import { type IpcMainListener } from ".";
import { workbooks } from "@/schema";
import { db } from "@/utils/db";

export const selectWorkbooks: IpcMainListener = (): {
  // これschemaから生成できないのか気になる
  id: number;
  title: string | null;
  created_at: string | null;
}[] => {
  const all = db.select().from(workbooks).all();

  return all;
};
