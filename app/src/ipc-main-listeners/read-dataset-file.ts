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
  const filePath =
    fileName === "dummy-data.csv"
      ? getDummyDataCsv()
      : path.resolve(folderPath, fileName);

  const data = readFileSync(filePath);

  return data;
}) satisfies IpcMainListener;

// TODO: 後で削除する
function getDummyDataCsv(): string {
  const isDev = process.env.NODE_ENV === "development";
  const directoryName = "public";
  const fileName = "dummy-data.csv";
  const filePath = isDev
    ? path.resolve(directoryName, fileName)
    : path.resolve(process.resourcesPath, directoryName, fileName);

  return filePath;
}
