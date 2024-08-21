import { type Map, type GeoJSONSourceSpecification } from "maplibre-gl";
import { useState, useEffect } from "react";

export type GeoJsonData = GeoJSONSourceSpecification["data"];
export const VACANCY_RATE_HIGH = 80;
export const VACANCY_RATE_MEDIUM = 30;

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
    paint: {
      "fill-color": [
        "case",
        [">=", ["get", "predicted_probability"], 0.8],
        "#C4314B66", // 赤 (80以上)
        [">=", ["get", "predicted_probability"], 0.3],
        "#FFA92966", // 黄 (30以上80未満)
        "#1B8C6366", // 青 (30未満)
      ],
      "fill-outline-color": [
        "case",
        [">=", ["get", "predicted_probability"], 0.8],
        "#C4314B", // 赤 (80以上)
        [">=", ["get", "predicted_probability"], 0.3],
        "#FFA929", // 黄 (30以上80未満)
        "#1B8C63", // 青 (30未満)
      ],
    },
  });
}

export function useGeoJsonData(): GeoJsonData | null {
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

  return geoJsonData;
}
