import { type AddLayerObject } from "maplibre-gl";

export const createAddLayerObject = (
  layerId: string,
  predictedProbability: { medium: number; high: number },
): AddLayerObject => ({
  id: layerId,
  type: "fill",
  source: layerId,
  maxzoom: 22,
  minzoom: 12,
  paint: {
    "fill-color": [
      "case",
      [">=", ["get", "predicted_probability"], predictedProbability.high],
      "#C4314B", // 赤 (80以上)
      [">=", ["get", "predicted_probability"], predictedProbability.medium],
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
      [">=", ["get", "predicted_probability"], predictedProbability.high],
      "#C4314B", // 赤 (80以上)
      [">=", ["get", "predicted_probability"], predictedProbability.medium],
      "#FFA929", // 黄 (30以上80未満)
      "#1B8C63", // 青 (30未満)
    ],
  },
});
