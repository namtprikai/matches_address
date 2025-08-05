import { wktToGeoJSON } from "betterknown";
import { type MapWithTableView } from "../../../../../bi-modules/interfaces/view";
import { type FilterCondition } from "../../../../../bi-modules/interfaces/parameter";
import { type FeatureData } from "../_types";
import { BATCH_SIZE } from "../_const";

export const fetchAndGenFeaturesBuildings = async ({
  selectedDate,
  lastId,
  view: { dataSetResultId, parameters },
}: {
  selectedDate: string;
  lastId: number;
  view: MapWithTableView;
}): Promise<FeatureData[]> => {
  const areaFilter = parameters.find((p) => p.key === "area");
  const areas = areaFilter?.value as string[] | undefined;

  // フィルター条件を抽出
  const filterConditions = parameters.filter(
    (p) => p.type === "filter" && p.key.startsWith("filter_"),
  ) as FilterCondition[];

  const fetchData = await window.ipcRenderer.invoke(
    "selectBuildingsInBatches",
    {
      dataSetResultId,
      referenceDate: selectedDate,
      areas,
      filterConditions,

      /** バッチ処理に必要 */
      batchSize: BATCH_SIZE,
      lastId,
    },
  );
  if (!fetchData) {
    throw new Error("Network response was not ok");
  }

  const features: (FeatureData | null)[] = fetchData.map(
    ({ geometry, ...properties }) => {
      const converted = wktToGeoJSON(geometry);
      if (!converted) return null;

      return {
        type: "Feature",
        geometry: converted,
        properties: {
          ...properties,
          geometry,
        },
      };
    },
  );
  return features.filter((f): f is FeatureData => f !== null);
};
