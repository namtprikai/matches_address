import { type LngLatLike, type Map } from "maplibre-gl";
import { useEffect } from "react";
import { getGeometry, type GetGeometryParams } from "../_utils/get-geometry";
import { getCenter } from "../_utils/get-center";

const INITIAL_CENTER: LngLatLike = [139.7671, 35.6812]; // 東京駅

type Params = {
  mapInstance: Map | null;
  getGeometryParams: GetGeometryParams;
};

/** マップの中心位置をデータセット情報をもとに設定 */
export const useSetMapCenterEffect = ({
  mapInstance,
  getGeometryParams,
}: Params): void => {
  /** 推定結果データの1行目のポリゴンの緯度経度を取得している */
  useEffect(
    function setMapCenterEffect() {
      if (!mapInstance) return;
      void (async () => {
        // geometryの文字列を取得する
        const geometry = await getGeometry(getGeometryParams);
        // betterknownでgeometryをGeoJSONに変換する(緯度経度の表現)
        const center = await getCenter(geometry);
        mapInstance.setCenter(center || INITIAL_CENTER);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 地図の中心を維持するために地図の初期化時のみ実行する
    [mapInstance],
  );
};
