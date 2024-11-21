import path from "path";
import { readFileSync } from "fs";
import { dbDirectory } from "../utils/db";
import { getFilePathInPublic } from "../utils/get-file-path-in-public";
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
      ? getFilePathInPublic(fileName)
      : path.resolve(dbDirectory, fileName);

  const data = readFileSync(filePath);

  return data;
}) satisfies IpcMainListener;
