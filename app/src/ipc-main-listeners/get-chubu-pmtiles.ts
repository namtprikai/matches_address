import path from "path";
import { readFile } from "fs/promises";
import { type IpcMainListener } from ".";

export const getChubuPmtiles = (async (_: unknown): Promise<Buffer> => {
  const isDev = process.env.NODE_ENV === "development";
  const assetsDirectory = path.resolve("./assets");
  const filePath = isDev
    ? path.join(assetsDirectory, "chubu.pmtiles")
    : path.resolve(process.resourcesPath, "chubu.pmtiles");
  const fileContent = await readFile(filePath);

  return fileContent;
}) satisfies IpcMainListener;
