import { type AddLayerObject } from "maplibre-gl";

const RED = "#C4314B";
const YELLOW = "#FFA929";
const GREEN = "#1B8C63";
const GRAY = "#999999";

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
      // 推定不可判定（outlier_flag, single_story_row_house_flag, matched_data_flagのいずれかが1）
      [
        "any",
        ["==", ["get", "outlier_flag"], 1],
        ["==", ["get", "single_story_row_house_flag"], 1],
        ["==", ["get", "matched_data_flag"], 1],
      ],
      GRAY,
      [">=", ["get", "predicted_probability"], predictedProbability.high],
      RED, // 赤 (80以上)
      [">=", ["get", "predicted_probability"], predictedProbability.medium],
      YELLOW, // 黄 (30以上80未満)
      GREEN, // 緑 (30未満)
    ],
    "fill-opacity": [
      "case",
      ["boolean", ["feature-state", "clicked"], false],
      0.8, // クリックされたポリゴンの不透明度
      0.4, // 通常の不透明度
    ],
    "fill-outline-color": [
      "case",
      // 推定不可判定（outlier_flag, single_story_row_house_flag, matched_data_flagのいずれかが1）
      [
        "any",
        ["==", ["get", "outlier_flag"], 1],
        ["==", ["get", "single_story_row_house_flag"], 1],
        ["==", ["get", "matched_data_flag"], 1],
      ],
      GRAY, // グレー（推定不可）
      [">=", ["get", "predicted_probability"], predictedProbability.high],
      RED, // 赤 (80以上)
      [">=", ["get", "predicted_probability"], predictedProbability.medium],
      YELLOW, // 黄 (30以上80未満)
      GREEN, // 緑 (30未満)
    ],
  },
});
