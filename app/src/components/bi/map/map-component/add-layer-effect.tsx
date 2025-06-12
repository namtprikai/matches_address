import { type Map } from "maplibre-gl";
import { createAddLayerObject } from "./_utils/create-add-layer-object";
import { type FeatureData } from "./_types";
import { PREDICTED_PROBABILITY } from ".";

type Params = {
  map: Map;
  layerId: string;
  features: FeatureData[];
  setSelectedFeature: (feature: FeatureData | null) => void;
};

export function addLayerEffect({
  map,
  layerId,
  features,
  setSelectedFeature,
}: Params): void {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(layerId)) {
    map.removeSource(layerId);
  }

  map.addSource(layerId, {
    type: "geojson",
    generateId: true, // featureのIDを個別に自動生成する、クリックしたポリゴンを判別して色を変えるために必要
    data: {
      type: "FeatureCollection",
      features,
    },
  });

  const { medium, high } = PREDICTED_PROBABILITY["building"];

  const addLayerObject = createAddLayerObject(layerId, { medium, high });
  map.addLayer(addLayerObject);

  map.on("click", layerId, (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0] as unknown as FeatureData;
      setSelectedFeature(feature);
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
