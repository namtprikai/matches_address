import { type Map } from "maplibre-gl";
import { type FeatureCollection } from "geojson";
import { useState, useEffect } from "react";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import { type data_set_detail_buildings } from "../../../schema";

export const VACANCY_RATE_HIGH = 0.8;
export const VACANCY_RATE_MEDIUM = 0.3;

export function addGeojsonSource(
  map: Map,
  sourceId: string,
  buildings: (typeof data_set_detail_buildings.$inferSelect)[],
): void {
  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: buildings.map((building) => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: JSON.parse(building.geometry),
        },
        properties: {
          predicted_probability: building.predicted_probability,
        },
      })),
    },
  });
}

export function addGeojsonLayer(
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

export function useGeojsonData(
  vacancyLevels: VacancyLevels,
): FeatureCollection | null {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(
    null,
  );

  useEffect(() => {
    const fetchGeojsonData = async (): Promise<void> => {
      try {
        const _data: FeatureCollection[] = await Promise.all(
          Array.from({ length: 10 }, (_, i) => i + 1).map(async (i) => {
            const response = await fetch(`/D902/${i}.json`);
            return await response.json();
          }),
        );

        const data: FeatureCollection = {
          type: "FeatureCollection",
          features: _data.flatMap((d) => d.features),
        };

        setGeojsonData(data);
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
      }
    };

    void fetchGeojsonData();
  }, []);

  const hasFeatures =
    geojsonData && typeof geojsonData === "object" && "features" in geojsonData;
  if (hasFeatures) {
    return {
      ...geojsonData,
      features: geojsonData.features.filter((feature) => {
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
