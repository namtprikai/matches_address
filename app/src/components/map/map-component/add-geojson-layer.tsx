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
    minzoom: 12,
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

  map.on("click", layerId, (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const properties = feature.properties as SelectDataSetDetailBuilding;
      const coordinates = e.lngLat;
      const popupContent = renderToString(
        <BuildingPopup properties={properties} />,
      );

      const popup = new Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);

      map.on("closeAllPopups", () => {
        popup.remove();
      });
    }
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
