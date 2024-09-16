import { eq } from "drizzle-orm";
import { data_set_detail_buildings } from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

// 使われていない。削除していいかもしれない？
/**
 * DataSetに含まれる都市名から、エリアを読み取る
 * - 複数の都道府県をまたがない前提の処理
 * @todo ローカルで取得できるように改修する必要がある
 */
export const readDataSetArea = (async (
  _: unknown,
  { dataSetResultId }: { dataSetResultId: number },
): Promise<null | string> => {
  const building = db
    .select()
    .from(data_set_detail_buildings)
    .where(eq(data_set_detail_buildings.data_set_result_id, dataSetResultId))
    .get();

  if (!building) return null;

  const zipcode = await fetch(
    `https://api.excelapi.org/post/zipcode?address=${building.normalized_address}`,
  ).then((res) => res.json());

  if (!zipcode) return null;

  const geo = await fetch(
    `https://geoapi.heartrails.com/api/json?method=searchByPostal&postal=${zipcode}`,
  ).then((res) => res.json());

  if (!geo.response.location) return null;

  const prefecture = geo.response.location[0].prefecture;

  if (!prefecture) return null;

  const cities = await fetch(
    `https://geoapi.heartrails.com/api/xml?method=getCities&prefecture=${prefecture}`,
  ).then((res) => res.text());

  return cities;
}) satisfies IpcMainListener;
