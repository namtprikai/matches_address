import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { addProtocol, type FilterSpecification, Map } from "maplibre-gl";
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
  selectedDate: string | undefined;
  vacancyLevels: VacancyLevels;
}

export function MapComponent({
  dataSetResultsId,
  type,
  selectedDate,
  vacancyLevels,
}: Props): JSX.Element {
  const styles = useMapComponentStyles();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [layerIds, setLayerIds] = useState<string[] | null>(null);

  useEffect(function initializeMapEffect() {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);

    const initializedMap = new Map({
      container: containerEl,
      style: "protomaps-basemaps.json",
      center: [137.120435, 34.990565],
      zoom: 14,
      maxZoom: 22,
      minZoom: 6,
    });

    initializedMap.on("load", () => {
      setMapInstance(initializedMap);
    });
  }, []);

  useEffect(
    function setMapCenterEffect() {
      if (!mapInstance || !selectedDate) return;

      const setMapCenter = async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke(
          "fetchBuildingsInBatches",
          {
            dataSetResultsId,
            referenceDate: selectedDate,
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

        mapInstance.setCenter(center);
      };

      void setMapCenter();
    },
    [dataSetResultsId, mapInstance, selectedDate],
  );

  useEffect(
    function addBuildingsLayerEffect() {
      if (!mapInstance || !selectedDate) return;
      let ignore = false;

      const addBuildingsLayer = async (): Promise<void> => {
        const batchSize = 1000;
        let lastId = 0;

        try {
          // eslint-disable-next-line no-constant-condition -- 無限ループでデータを全量取得する
          while (true) {
            if (ignore) break;

            const batch = await window.ipcRenderer.invoke(
              "fetchBuildingsInBatches",
              {
                dataSetResultsId,
                referenceDate: selectedDate,
                batchSize,
                lastId,
              },
            );

            if (!batch) {
              throw new Error("Network response was not ok");
            }

            const layerId = lastId.toString();
            addGeojsonLayer(mapInstance, layerId, batch, selectedDate);
            setLayerIds((prevLayerIds) =>
              prevLayerIds ? [...prevLayerIds, layerId] : [layerId],
            );

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

      return () => {
        ignore = true;
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
        mapInstance.fire("closeAllPopups");
      };
    },
    [dataSetResultsId, mapInstance, selectedDate],
  );

  useEffect(
    function applyFiltersEffect() {
      if (!mapInstance || !layerIds?.length) return;

      for (const layerId of layerIds) {
        const filters = [];
        if (vacancyLevels.low) {
          filters.push(["<", ["get", "predicted_probability"], 0.3]);
        }
        if (vacancyLevels.medium) {
          filters.push([
            "all",
            [">=", ["get", "predicted_probability"], 0.3],
            ["<", ["get", "predicted_probability"], 0.8],
          ]);
        }
        if (vacancyLevels.high) {
          filters.push([">=", ["get", "predicted_probability"], 0.8]);
        }

        const mapLibreFilter: FilterSpecification | undefined =
          filters.length > 0
            ? (["any", ...filters] as FilterSpecification)
            : undefined;
        mapInstance.setFilter(layerId, mapLibreFilter);
      }
    },
    [
      layerIds,
      mapInstance,
      vacancyLevels.high,
      vacancyLevels.low,
      vacancyLevels.medium,
    ],
  );

  return <div ref={containerRef} className={styles.map} />;
}
