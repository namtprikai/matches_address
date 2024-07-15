import { type IpcMainListener, initTestTable } from ".";
import { db } from "@/utils/db";

export const saveName: IpcMainListener = (_: unknown, name: string): void => {
  initTestTable();
  db.prepare<string>("INSERT INTO test (name) VALUES (?)").run(name);
};
