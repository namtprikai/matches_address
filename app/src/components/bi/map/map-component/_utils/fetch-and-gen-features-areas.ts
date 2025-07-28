import { wktToGeoJSON } from "betterknown";
import {
  type MapView,
  type MapWithTableView,
} from "../../../../../bi-modules/interfaces/view";
import { type FilterCondition } from "../../../../../bi-modules/interfaces/parameter";
import { type FeatureData } from "../_types";
import { BATCH_SIZE } from "../_const";

export const fetchAndGenFeaturesAreas = async ({
  selectedDate,
  lastId,
  view: { dataSetResultId, parameters },
}: {
  selectedDate: string;
  lastId: number;
  view: MapView | MapWithTableView;
}): Promise<FeatureData[]> => {
  const areaFilter = parameters.find((p) => p.key === "area");
  const areas = areaFilter?.value as string[] | undefined;

  // フィルター条件を抽出
  const filterConditions = parameters.filter(
    (p) => p.type === "filter" && p.key.startsWith("filter_"),
  ) as FilterCondition[];

  const fetchData = await window.ipcRenderer.invoke("selectAreasInBatches", {
    dataSetResultId,
    referenceDate: selectedDate,
    batchSize: BATCH_SIZE,
    lastId,
    areas,
    filterConditions,
  });
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
  const filtered = features.filter((f): f is FeatureData => f !== null);
  return filtered;
};
