import { Readable } from "stream";
import { parse } from "csv-parse";
import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
  type InsertDataSetDetailArea,
  type InsertDataSetDetailBuilding,
} from "../schema";
import { db } from "../utils/db";
import { type FileData } from "../components/dataset/dialog-create-result-dataset/type";
import { ResultDataSetMetadata } from "../components/dataset/result-dataset-metadata";
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
        await db
          .insert(data_set_detail_buildings)
          .values({
            ...(convertData(rest) as unknown as InsertDataSetDetailBuilding),
            data_set_result_id: dataSetResultsId,
            reference_date: rest.reference_date || "", // TODO: 2023-10-01に固定しているが、実際はCSVから取得する
          })
          .execute();
      },
    );

  // // 3. Convert CSV to object(for areas)
  if (areaFile)
    await parseCsvStream(
      areaFile,
      async ({ _id, _created_at, _updated_at, ...rest }) => {
        await db
          .insert(data_set_detail_areas)
          .values({
            ...(convertData(rest) as unknown as InsertDataSetDetailArea),
            data_set_result_id: dataSetResultsId,
            reference_date: rest.reference_date || "", // TODO: 2023-10-01に固定しているが、実際はCSVから取得する
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

const convertData = (input: Record<string, string>): Record<string, string> => {
  const labelToKeyMap: Record<string, string> = {};
  for (const [key, config] of Object.entries(ResultDataSetMetadata)) {
    labelToKeyMap[config.label] = key;
  }

  const converted: Record<string, string> = {};
  for (const [jpKey, value] of Object.entries(input)) {
    const enKey = labelToKeyMap[jpKey];
    if (enKey) {
      converted[enKey] = value;
    } else {
      // 変換できない場合はそのまま保持
      converted[jpKey] = value;
    }
  }
  return converted;
};
