import path from "path";

export function getFilePathInAssets(...filePaths: string[]): string {
  const isDev = process.env.NODE_ENV === "development";
  const basePath = isDev
    ? path.resolve("./assets")
    : path.join(process.resourcesPath, "assets");
  return path.join(basePath, ...filePaths);
}
