import path from "path";
import { readFileSync } from "fs";
import { type IpcMainListener } from ".";

export const readDatasetFile = (async (
  _: unknown,
  {
    fileName,
  }: {
    fileName: string;
  },
) => {
  const isDev = process.env.NODE_ENV === "development";
  const directoryName = "database";
  const folderPath = isDev
    ? path.resolve(directoryName)
    : path.resolve(process.resourcesPath, directoryName);
  const filePath = path.resolve(folderPath, fileName);

  const data = readFileSync(filePath);

  return data;
}) satisfies IpcMainListener;
