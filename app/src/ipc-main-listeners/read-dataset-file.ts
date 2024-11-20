import path from "path";
import { readFileSync } from "fs";
import { dbDirectoryPath } from "../utils/db";
import { getDummyDataCsv } from "../utils/get-dummy-data-csv";
import { type IpcMainListener } from ".";

export const readDatasetFile = (async (
  _: unknown,
  {
    fileName,
  }: {
    fileName: string;
  },
) => {
  const filePath =
    fileName === "dummy-data.csv"
      ? getDummyDataCsv()
      : path.resolve(dbDirectoryPath, fileName);

  const data = readFileSync(filePath);

  return data;
}) satisfies IpcMainListener;
