import { addProtocol, Map, removeProtocol } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef, useState } from "react";

export type MapInitReturn = {
  containerRef: React.RefObject<HTMLDivElement>;
  mapInstance: Map | null;
};

/** マップインスタンスを初期化・参照先を返却するHooks */
export const useMapInit = (): MapInitReturn => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 初期表示時にマップのサイズがおかしくなるので、親要素がマウントされた後にマップを初期化する
  useEffect(function setIsMountedEffect() {
    setIsMounted(true);
  }, []);

  useEffect(
    function initializeMapEffect() {
      if (!isMounted) return;

      const containerEl = containerRef.current;
      if (!containerEl) return;

      const protocol = new Protocol();
      addProtocol("pmtiles", protocol.tile);

      const initializedMap = new Map({
        container: containerEl,
        style: "protomaps-basemaps.json",
        zoom: 14,
        maxZoom: 22,
        minZoom: 6,
      });

      initializedMap.on("load", () => {
        setMapInstance(initializedMap);
      });

      return () => {
        removeProtocol("pmtiles");
      };
    },
    [isMounted],
  );

  return { containerRef, mapInstance };
};
