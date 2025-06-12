import {
  type MapView,
  type MapWithTableView,
} from "../../../../../bi-modules/interfaces/view";
import { type FeatureData } from "../_types";
import { fetchAndGenFeaturesAreas } from "./fetch-and-gen-features-areas";
import { fetchAndGenFeaturesBuildings } from "./fetch-and-gen-features-buildings";

export const getFeatures = async (params: {
  selectedDate: string;
  lastId: number;
  view: MapView | MapWithTableView;
}): Promise<FeatureData[]> => {
  const { unit } = params.view;
  switch (unit) {
    case "building": {
      const features = await fetchAndGenFeaturesBuildings(params);
      return features;
    }
    case "area": {
      const features = await fetchAndGenFeaturesAreas(params);
      return features;
    }

    default: {
      const exhaustiveCheck: never = unit;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
    }
  }
};
