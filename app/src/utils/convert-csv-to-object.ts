import { readFile } from "fs/promises";
import { parse } from "csv-parse";

interface Result {
  data: Record<string, string>[];
  meta: {
    fields: string[];
    rowCount: number;
  };
}

export async function convertCsvToObject(filePath: string): Promise<Result> {
  try {
    // ファイルを読み込む
    const fileContent = await readFile(filePath, {
      encoding: "utf8",
    });

    // CSVをパースしてPromiseを返す
    const parseAsync = (): Promise<Result> => {
      return new Promise((resolve, reject) => {
        const records: Result["data"] = [];
        const parser = parse(fileContent, {
          columns: true, // 1行目をヘッダーとして扱う
          skip_empty_lines: true, // 空行をスキップ
          trim: true, // 値の前後の空白を削除
          cast: true, // 自動的に型を変換
          cast_date: true, // 日付文字列を Date オブジェクトに変換
          bom: true, // BOMを自動的に処理
        });

        parser.on("readable", () => {
          let record;
          while ((record = parser.read()) !== null) {
            records.push(record);
          }
        });

        parser.on("end", () => {
          const headers = Object.keys(records[0] || {});
          resolve({
            data: records,
            meta: {
              fields: headers,
              rowCount: records.length,
            },
          });
        });

        parser.on("error", (err) => {
          reject(new Error(`CSVのパースに失敗しました: ${err.message}`));
        });
      });
    };

    return await parseAsync();
  } catch (error) {
    console.error("CSVの処理中にエラーが発生しました:", error);
    throw error;
  }
}
