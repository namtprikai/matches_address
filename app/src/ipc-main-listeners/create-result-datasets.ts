import { Readable } from "stream";
import { parse } from "csv-parse";
import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
  type InsertDataSetDetailArea,
  type InsertDataSetDetailBuilding,
} from "../schema";
import { type FileData } from "../components/dataset/dialog-create-result-dataset/type";
import {
  translateColumnToEnglish,
  type DatasetType,
} from "../shared/column-translation-utils";
import { db } from "../utils/db";
import { formatDate } from "../utils/format-date";
import { type IpcMainListener } from ".";

type Params = {
  buildingFile: FileData | null;
  areaFile: FileData | null;
};

export const createResultDatasets = (async (
  _: unknown,
  { buildingFile, areaFile }: Params,
): Promise<void> => {
  const title = `推定結果データ-${formatDate(new Date(), "HH:mm:ss")}`;

  // 1. Insert into data_set_results
  const { dataSetResultsId } = db
    .insert(data_set_results)
    .values({ title })
    .returning({ dataSetResultsId: data_set_results.id })
    .get();

  // 2. Convert CSV to object(for buildings)
  if (buildingFile)
    await parseCsvStream(
      buildingFile,
      async ({ _id, _created_at, _updated_at, ...rest }) => {
        // 日本語カラム名を英語に変換
        const convertedData = convertData(rest, "building");
        await db
          .insert(data_set_detail_buildings)
          .values({
            ...(convertedData as unknown as InsertDataSetDetailBuilding),
            data_set_result_id: dataSetResultsId,
            reference_date: convertedData.reference_date || "", // TODO: 2023-10-01に固定しているが、実際はCSVから取得する
          })
          .execute();
      },
    );

  // // 3. Convert CSV to object(for areas)
  if (areaFile)
    await parseCsvStream(
      areaFile,
      async ({ _id, _created_at, _updated_at, ...rest }) => {
        // 日本語カラム名を英語に変換
        const convertedData = convertData(rest, "area");
        await db
          .insert(data_set_detail_areas)
          .values({
            ...(convertedData as unknown as InsertDataSetDetailArea),
            data_set_result_id: dataSetResultsId,
            reference_date: convertedData.reference_date || "", // TODO: 2023-10-01に固定しているが、実際はCSVから取得する
          })
          .execute();
      },
    );
}) satisfies IpcMainListener;

const parseCsvStream = async (
  fileData: FileData,
  onData: (record: Record<string, string>) => Promise<void>,
): Promise<{
  meta: { name: string; fields: string[]; rowCount: number };
}> => {
  try {
    return new Promise((resolve, reject) => {
      const headers: string[] = [];
      let rowCount = 0;

      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      const stream = Readable.from([fileData.content]);
      stream
        .pipe(parser)
        .on("data", (row) => {
          onData(row)
            .then(() => {
              rowCount++;
              parser.resume();
            })
            .catch(reject);
        })
        .on("end", () => {
          resolve({ meta: { name: fileData.name, fields: headers, rowCount } });
        })
        .on("error", (err) => {
          reject(new Error(`CSVのパースに失敗しました: ${err.message}`));
        });
    });
  } catch (error) {
    console.error("CSVの処理中にエラーが発生しました:", error);
    throw error;
  }
};

const convertData = (
  input: Record<string, string>,
  datasetType: DatasetType,
): Record<string, string> => {
  const converted: Record<string, string> = {};
  const unmappedColumns: string[] = [];

  for (const [jpKey, value] of Object.entries(input)) {
    // 日本語カラム名を英語に変換
    const enKey = translateColumnToEnglish(jpKey, datasetType);

    // 変換できなかった場合（元のキーが返ってきた場合）
    if (enKey === jpKey && jpKey !== "geometry") {
      // geometryは元々英語なので除外
      unmappedColumns.push(jpKey);
    }

    converted[enKey] = value;
  }

  // 変換できなかったカラムがある場合は警告を出力
  if (unmappedColumns.length > 0) {
    console.warn(
      `[警告] 以下のカラムは英語名に変換できませんでした（${datasetType}）:`,
      unmappedColumns.join(", "),
    );
  }

  return converted;
};
