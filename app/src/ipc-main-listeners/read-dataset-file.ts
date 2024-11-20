import path from "path";
import { readFileSync } from "fs";
import { dbDirectoryPath } from "../utils/db";
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
      : path.resolve(dbDirectoryPath, fileName);

  const data = readFileSync(filePath);

  return data;
}) satisfies IpcMainListener;
