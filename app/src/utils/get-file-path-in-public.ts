import path from "path";

/** Publicフォルダのアセットにアクセスする・開発向けの関数 */
export function getFilePathInPublic(...filePaths: string[]): string {
  const isDev = process.env.NODE_ENV === "development";
  const directoryName = "public";
  const basePath = isDev
    ? path.resolve(directoryName)
    : path.join(process.resourcesPath, directoryName);

  return path.join(basePath, ...filePaths);
}
