import { Popup, type Map } from "maplibre-gl";
import { renderToString } from "react-dom/server";
import { type SelectDataSetDetailBuilding } from "../../../schema";
import { BuildingPopup } from "./building-popup";

export const VACANCY_RATE_HIGH = 0.8;
export const VACANCY_RATE_MEDIUM = 0.3;

export function addGeojsonLayer(
  map: Map,
  layerId: string,
  buildings: SelectDataSetDetailBuilding[],
  selectedDate: string,
): void {
  map.addSource(layerId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: buildings.map((building) => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: JSON.parse(building.geometry),
        },
        properties: building,
      })),
    },
  });

  map.addLayer({
    id: layerId,
    type: "fill",
    source: layerId,
    maxzoom: 22,
    minzoom: 10,
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

  const popup = new Popup();
  map.on("click", layerId, (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const properties = feature.properties;
      const coordinates = e.lngLat;
      const popupContent = renderToString(
        <BuildingPopup
          data={{
            // デモデータ
            address: "東京都千代田区丸の内1-1-1",
            totalPopulation: 1000,
            under14: 200,
            between15And64: 600,
            over65: 200,
            waterUsage: "1000L",
            waterStatus: "良好",
            constructionDate: selectedDate,
            structureName: "RC造",
            vacancyRate: properties?.predicted_probability,
          }}
        />,
      );

      popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
    }
  });

  map.on("closeAllPopups", () => {
    popup.remove();
  });

  // ポリゴンレイヤーにマウスが乗ったときにカーソルを変更
  map.on("mouseenter", layerId, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // ポリゴンレイヤーからマウスが離れたときにカーソルを元に戻す
  map.on("mouseleave", layerId, () => {
    map.getCanvas().style.cursor = "";
  });
}
