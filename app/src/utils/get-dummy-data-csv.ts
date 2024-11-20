import path from "path";

export function getDummyDataCsv(): string {
  const isDev = process.env.NODE_ENV === "development";
  const directoryName = "public";
  const fileName = "dummy-data.csv";
  const filePath = isDev
    ? path.resolve(directoryName, fileName)
    : path.resolve(process.resourcesPath, directoryName, fileName);

  return filePath;
}
