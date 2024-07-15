import { type IpcMainListener, initTestTable } from ".";
import { db } from "@/utils/db";

export const getNames: IpcMainListener = (): string[] => {
  initTestTable();

  if (db.prepare("SELECT * FROM test").all().length === 0) {
    db.prepare("INSERT INTO test (name) VALUES (?)").run("John Doe");
  }

  const rows = db
    .prepare<[], { id: number; name: string }>("SELECT * FROM test")
    .all();
  const names = rows.map((row) => row.name);

  return names;
};
