import { type IpcMainListener } from ".";
import { users } from "@/schema";
import { db } from "@/utils/db";

export const getNames: IpcMainListener = (): (string | null)[] => {
  let allUsers = db.select().from(users).all();

  if (allUsers.length === 0) {
    void db.insert(users).values({ name: "John Doe" }).run();
    allUsers = db.select().from(users).all();
  }
  const names = allUsers.map((row) => row.name);

  return names;
};
