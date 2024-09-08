import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { addProtocol, Map } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { makeStyles } from "@fluentui/react-components";
import { type Polygon } from "geojson";
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

  useEffect(
    function initializeMapEffect() {
      const containerEl = containerRef.current;
      if (!containerEl) return;

      const protocol = new Protocol();
      addProtocol("pmtiles", protocol.tile);

      const initializeMap = async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke(
          "fetchBuildingsInBatches",
          {
            dataSetResultsId,
            batchSize: 1,
          },
        );

        if (!result?.length) return;

        const [firstItem] = result;

        const coordinates: Polygon["coordinates"] = JSON.parse(
          firstItem.geometry,
        );
        const center: [number, number] =
          coordinates[0][0][0] && coordinates[0][0][1]
            ? [coordinates[0][0][0], coordinates[0][0][1]]
            : [137.120435, 34.990565];

        const initializedMap = new Map({
          container: containerEl,
          style: "protomaps-basemaps.json",
          center,
          zoom: 14,
          maxZoom: 22,
          minZoom: 6,
        });

        initializedMap.on("load", () => {
          setMapInstance(initializedMap);
        });
      };

      void initializeMap();
    },
    [dataSetResultsId],
  );

  useEffect(
    function addBuildingsLayerEffect() {
      if (!mapInstance) return;

      const addBuildingsLayer = async (): Promise<void> => {
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

      void addBuildingsLayer();
    },
    [dataSetResultsId, mapInstance],
  );

  return <div ref={containerRef} className={styles.map} />;
}
