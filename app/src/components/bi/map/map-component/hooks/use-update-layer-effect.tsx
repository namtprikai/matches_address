import { Popup, type Map } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import {
  type MapView,
  type MapWithTableView,
} from "../../../../../bi-modules/interfaces/view";
import { BuildingPopup, type BuildingProperties } from "../building-popup";

import { addLayerEffect } from "../add-layer-effect";
import { getLngLatFromGeometry } from "../_utils/get-lng-lat-from-geometry";
import { AreaPopup, type AreaProperties } from "../area-popup";
import { type FeatureData } from "../_types";
import { BATCH_SIZE } from "../_const";
import { getFeatures } from "../_utils/get-features";

type Props = {
  mapInstance: Map | null;
  selectedDate: string | undefined;
  view: MapView | MapWithTableView;
};

export type UpdateLayerEffectReturn = {
  layerIds: string[] | null;
  features: FeatureData[] | null;
  selectedFeature: FeatureData | null;
  setSelectedFeature: (feature: FeatureData | null) => void;
};

/**
 * BATCH_SIZEで設定した件数ごとにデータを取得し、レイヤを追加し、Popupを管理するエフェクト.
 * - 数万件規模のときに、1回のリクエストで全件取得するとメモリを圧迫するため
 * - 処理の実態はhandleLayer内の分岐にある
 */
export const useUpdateLayerEffect = ({
  mapInstance,
  selectedDate,
  view,
}: Props): UpdateLayerEffectReturn => {
  const [layerIds, setLayerIds] = useState<string[] | null>(null);

  /** データセットデータをFeature型のリストとして保持する. */
  const [features, setFeatures] = useState<FeatureData[] | null>(null);
  const handleFeatures = (newFeatures: FeatureData[]): void => {
    setFeatures(newFeatures);
  };

  const { selectedFeature, setSelectedFeature } = _usePopupEffectWithFeature({
    mapInstance,
    view,
  });

  /** レイヤーにイベント・リソースを追加 */
  useEffect(() => {
    if (!mapInstance || !selectedDate) return;
    let ignore = false; /** unmount時にbatchを停止するため */

    const fetchAndAddLayerWithBatch = async (): Promise<void> => {
      let batchLastId = 0;

      try {
        // eslint-disable-next-line no-constant-condition -- 無限ループでデータを全量取得する
        while (true) {
          if (ignore) break;

          const layerId = `${view.unit === "building" ? "building" : "area"}-${batchLastId.toString()}`;
          const features = await getFeatures({
            selectedDate,
            lastId: batchLastId,
            view,
          });
          handleFeatures(features);

          addLayerEffect({
            map: mapInstance,
            layerId,
            features,
            setSelectedFeature,
          });

          setLayerIds((prevLayerIds) =>
            prevLayerIds ? [...prevLayerIds, layerId] : [layerId],
          );

          if (features.length < BATCH_SIZE) {
            // 最後のバッチを取得完了して終了
            break;
          }
          batchLastId = features[features.length - 1].properties.id; // バッチ処理の最後のIDを更新

          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchAndAddLayerWithBatch().catch(console.error);

    return () => {
      ignore = true;
      mapInstance.fire("closeAllPopups");
      setLayerIds((prevLayerIds) => {
        prevLayerIds?.forEach((layerId) => {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
          if (mapInstance.getSource(layerId)) {
            mapInstance.removeSource(layerId);
          }
        });
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 依存配列にview全体を含める必要がないため
  }, [
    mapInstance,
    selectedDate,
    view.dataSetResultId,
    view.unit,
    view.parameters,
  ]);

  return { layerIds, features, selectedFeature, setSelectedFeature };
};

/** ポップアップの制御に関するエフェクト */
const _usePopupEffectWithFeature = ({
  mapInstance,
  view: { unit, parameters },
}: {
  mapInstance: Map | null;
  view: MapView | MapWithTableView;
}): {
  selectedFeature: FeatureData | null;
  setSelectedFeature: (feature: FeatureData | null) => void;
} => {
  const popupRef = useRef<Popup | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(
    null,
  );

  useEffect(() => {
    /** 設定が変更された場合選択されたフィーチャーをクリア */
    setSelectedFeature(null);
  }, [unit, parameters]);

  /** ポップアップの制御 */
  useEffect(() => {
    if (!mapInstance || !selectedFeature) return;

    // ポップアップのクリーンアップ
    if (popupRef.current) {
      popupRef.current.remove();
    }

    const coordinates = getLngLatFromGeometry(selectedFeature.geometry);
    const popupContent = renderToString(
      unit === "building" ? (
        <BuildingPopup
          properties={selectedFeature.properties as BuildingProperties}
        />
      ) : (
        <AreaPopup properties={selectedFeature.properties as AreaProperties} />
      ),
    );

    // 新たにポップアップ表示
    const popup = new Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(mapInstance);

    popupRef.current = popup;

    // 移動する
    mapInstance.flyTo({
      center: coordinates,
      padding: { bottom: 200 },
    });

    return () => {
      // ポップアップのクリーンアップ
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [mapInstance, selectedFeature, unit]);

  return { selectedFeature, setSelectedFeature };
};
