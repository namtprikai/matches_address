import { getFilePathInPublic } from "../utils/get-file-path-in-public";
import { convertCsvToObject } from "../utils/convert-csv-to-object";
import { db } from "../utils/db";
import {
  data_set_detail_areas,
  data_set_detail_buildings,
  data_set_results,
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
    const filePath = getFilePathInPublic("D902_workshop.csv");
    const converted = await convertCsvToObject(filePath);
    return converted.data;
  })();

  await Promise.all(
    buildings.map(
      async ({ id, created_at, updated_at, data_set_result_id, ...rest }) => {
        await db
          .insert(data_set_detail_buildings)
          .values({
            ...(rest as unknown as InsertDataSetDetailBuilding),
            data_set_result_id: dataSetResultsId,
          })
          .execute();
      },
    ),
  );

  const areas = await (async () => {
    const filePath = getFilePathInPublic("D903_workshop.csv");
    const converted = await convertCsvToObject(filePath);
    return converted.data;
  })();

  await Promise.all(
    areas.map(
      async ({ id, created_at, updated_at, data_set_result_id, ...rest }) => {
        await db
          .insert(data_set_detail_areas)
          .values({
            ...(rest as unknown as InsertDataSetDetailBuilding),
            data_set_result_id: dataSetResultsId,
          })
          .execute();
      },
    ),
  );
}) satisfies IpcMainListener;
