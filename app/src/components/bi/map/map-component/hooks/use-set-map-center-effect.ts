import { LngLat, type Map } from "maplibre-gl";
import { useEffect, useState } from "react";
import { getGeometry, type GetGeometryParams } from "../_utils/get-geometry";
import { getCenter } from "../_utils/get-center";
import { convertToLngLat } from "../_utils/convert-to-lng-lat";
import { type UpdateLayerEffectReturn } from "./use-update-layer-effect";

const INITIAL_CENTER: LngLat = new LngLat(139.7671, 35.6812); // 東京駅

type Params = {
  resultViewId: number;
  mapInstance: Map | null;
  getGeometryParams: GetGeometryParams;
  clearPopup: UpdateLayerEffectReturn["clearPopup"];
};

type Return = {
  resetCenter: () => void;
  centerIsDirty: boolean;
  saveCurrentCenter: () => Promise<void>;
};

/** マップの中心位置をデータセット情報をもとに設定 */
export const useSetMapCenterEffect = ({
  mapInstance,
  getGeometryParams,
  resultViewId,
  clearPopup,
}: Params): Return => {
  const [center, setCenter] = useState<LngLat>(INITIAL_CENTER);
  const [centerIsDirty, setCenterIsDirty] = useState(false);

  const handleCenterChange = (lngLat: LngLat): void => {
    if (!mapInstance) return;
    setCenter(lngLat);
    mapInstance.setCenter(lngLat);
    setCenterIsDirty(
      false,
    ); /** @fixme isEqualLngLatが正しく挙動すれば必要ない */
    clearPopup();
  };

  const saveCurrentCenter = async (): Promise<void> => {
    if (!mapInstance) return;
    const currentCenter = mapInstance.getCenter();
    setCenter(currentCenter);
    setCenterIsDirty(false);

    await window.ipcRenderer.invoke("updateMapCenter", {
      resultViewId,
      mapCenter: {
        key: "map_center",
        type: "map",
        value: currentCenter,
      },
    });
  };

  const watchMapCenterEqual = (): void => {
    if (!mapInstance) return;

    const currentCenter = mapInstance.getCenter();

    if (isEqualLngLat(currentCenter, convertToLngLat(center))) {
      setCenterIsDirty(false);
    } else {
      setCenterIsDirty(true);
    }
  };

  mapInstance?.on("drag", watchMapCenterEqual);
  mapInstance?.on("moveend", watchMapCenterEqual);

  /** 推定結果データの1行目のポリゴンの緯度経度を取得している */
  useEffect(
    function setMapCenterEffect() {
      if (!mapInstance) return;
      void (async () => {
        const { mapCenter } = await window.ipcRenderer.invoke(
          "selectMapCenter",
          {
            resultViewId: Number(resultViewId),
          },
        );

        if (mapCenter && mapCenter.value) {
          // 取得したmapCenterが存在する場合は、地図の中心を設定
          handleCenterChange(
            new LngLat(mapCenter.value.lng, mapCenter.value.lat),
          );
          return;
        }

        // geometryの文字列を取得する
        const geometry = await getGeometry(getGeometryParams);

        // betterknownでgeometryをGeoJSONに変換する(緯度経度の表現)
        const center = await getCenter(geometry);

        handleCenterChange(center ? convertToLngLat(center) : INITIAL_CENTER);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 地図の中心を維持するために地図の初期化時のみ実行する
    [mapInstance],
  );

  return {
    resetCenter: () => handleCenterChange(center || INITIAL_CENTER),
    centerIsDirty,
    saveCurrentCenter,
  };
};

// LngLat型のオブジェクトを同等かどうかを比較する関数. ただし、値は厳密に比較しない
const isEqualLngLat = (a: LngLat, b: LngLat): boolean => {
  const precision = 10000; // 小数点以下4桁までの精度で比較
  // 許容する誤差の値
  const tolerance = 10;

  return (
    Math.abs(a.lng - b.lng) * precision < tolerance &&
    Math.abs(a.lat - b.lat) * precision < tolerance
  );
};
