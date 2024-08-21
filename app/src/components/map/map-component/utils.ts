import { type Map, type GeoJSONSourceSpecification } from "maplibre-gl";
import { useState, useEffect } from "react";
import { type VacancyLevels } from "../vacancy-level-checkbox";

export type GeoJsonData = GeoJSONSourceSpecification["data"];
const VACANCY_RATE_HIGH = 0.8;
const VACANCY_RATE_MEDIUM = 0.3;

export function addGeoJsonSource(
  map: Map,
  sourceId: string,
  geoJsonData: GeoJsonData,
): void {
  map.addSource(sourceId, {
    type: "geojson",
    data: geoJsonData,
  });
}

export function addGeoJsonLayer(
  map: Map,
  layerId: string,
  sourceId: string,
): void {
  map.addLayer({
    id: layerId,
    type: "fill",
    source: sourceId,
    maxzoom: 22,
    minzoom: 14,
    paint: {
      "fill-color": [
        "case",
        [">=", ["get", "predicted_probability"], VACANCY_RATE_HIGH],
        "#C4314B66", // 赤 (80以上)
        [">=", ["get", "predicted_probability"], VACANCY_RATE_MEDIUM],
        "#FFA92966", // 黄 (30以上80未満)
        "#1B8C6366", // 青 (30未満)
      ],
      "fill-outline-color": [
        "case",
        [">=", ["get", "predicted_probability"], VACANCY_RATE_HIGH],
        "#C4314B", // 赤 (80以上)
        [">=", ["get", "predicted_probability"], VACANCY_RATE_MEDIUM],
        "#FFA929", // 黄 (30以上80未満)
        "#1B8C63", // 青 (30未満)
      ],
    },
  });
}

export function useGeoJsonData(
  vacancyLevels: VacancyLevels,
): GeoJsonData | null {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    const fetchGeoJsonData = async (): Promise<void> => {
      try {
        const response = await fetch("/D902.geojson");
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    void fetchGeoJsonData();
  }, []);

  const hasFeatures =
    geoJsonData && typeof geoJsonData === "object" && "features" in geoJsonData;
  if (hasFeatures) {
    return {
      ...geoJsonData,
      features: geoJsonData.features.filter((feature) => {
        const predictedProbability = feature.properties?.predicted_probability;
        if (predictedProbability >= VACANCY_RATE_HIGH) {
          return vacancyLevels.high;
        } else if (predictedProbability >= VACANCY_RATE_MEDIUM) {
          return vacancyLevels.medium;
        } else {
          return vacancyLevels.low;
        }
      }),
    };
  }

  return null;
}
