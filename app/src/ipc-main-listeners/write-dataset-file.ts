import path from "path";
import { existsSync, mkdirSync, writeFile } from "fs";
import { type IpcMainListener } from ".";

export const writeDatasetFile = ((
  _: unknown,
  {
    data,
    fileName,
  }: {
    data: number[];
    fileName: string;
  },
) => {
  const isDev = process.env.NODE_ENV === "development";
  const folderName = "database";
  const folderPath = isDev
    ? path.resolve(`./${folderName}`)
    : path.resolve(process.resourcesPath, folderName);

  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const uint8Array = new Uint8Array(data);
  const filePath = path.resolve(folderPath, fileName);
  writeFile(filePath, uint8Array, (err) => {
    if (err) {
      console.error("ファイルの保存中にエラーが発生しました:", err);
    } else {
      console.info("ファイルが正常に保存されました:", filePath);
    }
  });
}) satisfies IpcMainListener;
