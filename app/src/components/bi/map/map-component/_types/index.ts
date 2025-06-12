import { type Geometry } from "geojson";
import { type BuildingProperties } from "../building-popup";
import { type AreaProperties } from "../area-popup";

export type FeatureData = {
  type: "Feature";
  geometry: Geometry;
  properties: BuildingProperties | AreaProperties;
};
