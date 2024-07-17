import { type IpcMainListener } from ".";
import { users } from "@/schema";
import { db } from "@/utils/db";

export const getNames: IpcMainListener = (): (string | null)[] => {
  const allUsers = db.select().from(users).all();

  if (allUsers.length === 0) {
    void db.insert(users).values({ name: "John Doe" }).run();
  }
  const names = allUsers.map((row) => row.name);

  return names;
};
