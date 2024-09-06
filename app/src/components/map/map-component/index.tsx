import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { addProtocol, Map } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { makeStyles } from "@fluentui/react-components";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import { addGeojsonLayer } from "./add-geojson-layer";

const useMapComponentStyles = makeStyles({
  map: {
    width: "100%",
    height: "600px",
  },
});

interface Props {
  dataSetResultsId: number;
  type: "building" | "area";
  // selectedYear: number;
  vacancyLevels: VacancyLevels;
}

export function MapComponent({
  dataSetResultsId,
  type,
  // selectedYear,
  vacancyLevels,
}: Props): JSX.Element {
  const styles = useMapComponentStyles();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  useEffect(function initializeMap() {
    if (!containerRef.current) return;
    const protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);

    const initializedMap = new Map({
      container: containerRef.current,
      style: "protomaps-basemaps.json",
      center: [137.120435, 34.990565],
      zoom: 19,
      maxZoom: 18,
      minZoom: 6,
    });

    initializedMap.on("load", () => {
      setMapInstance(initializedMap);
    });

    return () => {
      initializedMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const fetchData = async (): Promise<void> => {
      const batchSize = 1000;
      let lastId = 0;

      try {
        // eslint-disable-next-line no-constant-condition -- 無限ループでデータを全量取得する
        while (true) {
          const batch = await window.ipcRenderer.invoke(
            "fetchBuildingsInBatches",
            {
              dataSetResultsId,
              batchSize,
              lastId,
            },
          );

          if (!batch) {
            throw new Error("Network response was not ok");
          }

          const layerId = lastId.toString();
          addGeojsonLayer(mapInstance, layerId, batch);

          if (batch.length < batchSize) {
            // 最後のバッチを取得完了
            break;
          }

          lastId = batch[batch.length - 1].id;
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    void fetchData();
  }, [dataSetResultsId, mapInstance]);

  return <div ref={containerRef} className={styles.map} />;
}
