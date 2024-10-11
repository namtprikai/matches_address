import { createReadStream } from "fs";

/**
 * CSVファイルのヘッダーのみを読み込み、文字列の配列で返す関数
 * @param filePath CSVファイルの絶対パスを指定
 * @returns CSVファイルのヘッダーを文字列の配列で返す
 */
export const readCSVHeader = async (filePath: string): Promise<string[]> => {
  // readStreamはasync/awaitで扱えないのでPromiseを使い、resolveで値を返す
  const promise = new Promise<string[]>((resolve) => {
    const readStream = createReadStream(filePath);
    let buffer = "";
    let header: string[] = [];
    let isHeader = true;

    readStream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");

      if (isHeader) {
        header = lines[0].split(",");
        isHeader = false;
      }

      if (lines.length > 1) {
        readStream.close();
        resolve(header);
      }
    });
  });

  return await promise;
};
