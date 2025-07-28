import { wktToGeoJSON } from "betterknown";
import {
  type MapView,
  type MapWithTableView,
} from "../../../../../bi-modules/interfaces/view";
import { type FilterCondition } from "../../../../../bi-modules/interfaces/parameter";
import { type BuildingProperties } from "../building-popup";
import { type FeatureData } from "../_types";
import { BATCH_SIZE } from "../_const";

export const fetchAndGenFeaturesBuildings = async ({
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
  const filteredData: BuildingProperties[] = fetchData.map((building) => ({
    id: building.id,
    geometry: building.geometry,
    predicted_probability: building.predicted_probability,
    normalized_address: building.normalized_address,
    household_size: building.household_size,
    members_under_15: building.members_under_15,
    members_15_to_64: building.members_15_to_64,
    members_over_65: building.members_over_65,
    total_water_usage: building.total_water_usage,
    water_disconnection_flag: building.water_disconnection_flag,
    registration_date: building.registration_date,
    structure_name: building.structure_name,
  }));

  const features: (FeatureData | null)[] = filteredData.map(
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
