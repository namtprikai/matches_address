import { readFile } from "fs/promises";
import { getFilePathInAssets } from "../utils/get-file-path-in-assets";
import { type IpcMainListener } from ".";

export const getChubuPmtiles = (async (_: unknown): Promise<Buffer> => {
  const filePath = getFilePathInAssets("chubu.pmtiles");
  const fileContent = await readFile(filePath);

  return fileContent;
}) satisfies IpcMainListener;
