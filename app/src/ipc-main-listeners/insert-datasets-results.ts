import {
  type InsertDataSetDetailBuilding,
  type InsertNormalizedDataSet,
  data_set_detail_buildings,
  data_set_results,
} from "../schema";
import { db } from "../utils/db";
import { convertCsvToObject } from "../utils/convert-csv-to-object";
import { getFilePathInDummyData } from "../utils/get-file-path-in-dummy-data";
import { type IpcMainListener } from ".";

export const insertDatasetsResults = (async (
  _: unknown,
  { file_name, file_path }: InsertNormalizedDataSet,
): Promise<{ insertedId: number }> => {
  /** step1: data_set_resultsにレコードを追加してidを取得 */
  const { dataSetResultsId } = db
    .insert(data_set_results)
    .values({ title: file_name })
    .returning({ dataSetResultsId: data_set_results.id })
    .get();

  /** step2: ファイルの内容を取得してdata_set_detail_buildingsに追加 */
  await convertCsvToObject(
    getFilePathInDummyData(file_path),
    // idや作成日時はinsertしないようにする
    async ({ _id, _created_at, _updated_at, ...rest }) => {
      await db
        .insert(data_set_detail_buildings)
        .values({
          ...(rest as unknown as InsertDataSetDetailBuilding),
          data_set_result_id: dataSetResultsId,
        })
        .execute();
    },
  );

  return { insertedId: dataSetResultsId };
}) satisfies IpcMainListener;
