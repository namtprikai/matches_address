import { type FeatureIdentifier, Popup, type Map } from "maplibre-gl";
import { renderToString } from "react-dom/server";
import { type SelectDataSetDetailArea } from "../../../schema";
import { AreaPopup, type AreaProperties } from "./area-popup";
import { VACANCY_RATE_HIGH, VACANCY_RATE_MEDIUM } from ".";

export function addAreaLayer(
  map: Map,
  layerId: string,
  buildings: AreaProperties[],
): void {
  if (map.getLayer(layerId)) return;

  map.addSource(layerId, {
    type: "geojson",
    generateId: true, // featureのIDを個別に自動生成する、クリックしたポリゴンを判別して色を変えるために必要
    data: {
      type: "FeatureCollection",
      features: buildings.map(({ geometry, ...properties }) => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: JSON.parse(geometry),
        },
        properties,
      })),
    },
  });

  map.addLayer({
    id: layerId,
    type: "fill",
    source: layerId,
    maxzoom: 22,
    minzoom: 7,
    paint: {
      "fill-color": [
        "case",
        [">=", ["get", "predicted_probability"], VACANCY_RATE_HIGH],
        "#C4314B", // 赤 (80以上)
        [">=", ["get", "predicted_probability"], VACANCY_RATE_MEDIUM],
        "#FFA929", // 黄 (30以上80未満)
        "#1B8C63", // 青 (30未満)
      ],
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "clicked"], false],
        0.8, // クリックされたポリゴンの不透明度
        0.4, // 通常の不透明度
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

  let clickedId: FeatureIdentifier["id"] = undefined;

  map.on("click", layerId, (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const properties = feature.properties as SelectDataSetDetailArea;
      const coordinates = e.lngLat;
      const popupContent = renderToString(
        <AreaPopup properties={properties} />,
      );

      const popup = new Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);

      map.on("closeAllPopups", () => {
        popup.remove();
      });

      // 以前にクリックされたポリゴンの状態をリセット
      if (clickedId !== undefined) {
        map.setFeatureState(
          { source: layerId, id: clickedId },
          { clicked: false },
        );
      }

      // 新しくクリックされたポリゴンの状態を設定
      clickedId = feature.id;
      map.setFeatureState(
        { source: layerId, id: clickedId },
        { clicked: true },
      );
    }
  });

  // マップのクリックイベントで、ポリゴン外をクリックした場合の処理
  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
    if (features.length === 0 && clickedId !== undefined) {
      map.setFeatureState(
        { source: layerId, id: clickedId },
        { clicked: false },
      );
      clickedId = undefined;
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
