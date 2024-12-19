import { getFilePathInDummyData } from "../utils/get-file-path-in-dummy-data";
import { convertCsvToObject } from "../utils/convert-csv-to-object";
import { db } from "../utils/db";
import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
  type InsertDataSetDetailArea,
  type InsertDataSetDetailBuilding,
} from "../schema";
import { type IpcMainListener } from ".";

export const _debugCreateWorkshopData = (async (
  _: unknown,
  { title }: { title: string },
) => {
  const { dataSetResultsId } = await db
    .insert(data_set_results)
    .values({ title })
    .returning({ dataSetResultsId: data_set_results.id })
    .get();

  const buildings = await (async () => {
    // TODO: 建物データは大きそうなので分割してインサートしないとメモリリークするかも
    const filePath = getFilePathInDummyData("D902_workshop.csv");
    const converted = await convertCsvToObject(filePath);
    return converted.data;
  })();

  await Promise.all(
    buildings.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- idや作成日時はinsertしないようにする
      async ({ id, created_at, updated_at, ...rest }) => {
        await db
          .insert(data_set_detail_buildings)
          .values({
            ...(rest as unknown as InsertDataSetDetailBuilding), // 想定通りのデータがくるので型エラーを無視する
            data_set_result_id: dataSetResultsId,
          })
          .execute();
      },
    ),
  );

  const areas = await (async () => {
    const filePath = getFilePathInDummyData("D903_workshop.csv");
    const converted = await convertCsvToObject(filePath);
    return converted.data;
  })();

  await Promise.all(
    areas.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- idや作成日時はinsertしないようにする
      async ({ id, created_at, updated_at, ...rest }) => {
        await db
          .insert(data_set_detail_areas)
          .values({
            ...(rest as unknown as InsertDataSetDetailArea), // 想定通りのデータがくるので型エラーを無視する
            data_set_result_id: dataSetResultsId,
          })
          .execute();
      },
    ),
  );
}) satisfies IpcMainListener;
