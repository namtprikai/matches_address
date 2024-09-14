import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import {
  addProtocol,
  type FilterSpecification,
  Map,
  removeProtocol,
  type StyleSpecification,
} from "maplibre-gl";
import { type FileSource, PMTiles, Protocol } from "pmtiles";
import { makeStyles } from "@fluentui/react-components";
import { type Polygon } from "geojson";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import protomapsBasemapsJson from "../../../../assets/protomaps-basemaps.json";
import { addBuildingLayer } from "./add-building-layer";
import { type BuildingProperties } from "./building-popup";
import { addAreaLayer } from "./add-area-layer";

export const VACANCY_RATE_HIGH = 0.8;
export const VACANCY_RATE_MEDIUM = 0.3;

const useMapComponentStyles = makeStyles({
  map: {
    width: "100%",
    height: "600px",
  },
});

interface Props {
  dataSetResultId: number;
  type: "building" | "area";
  selectedDate: string | undefined;
  vacancyLevels: VacancyLevels;
}

export function MapComponent({
  dataSetResultId,
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

    const initializeMap = async (): Promise<void> => {
      const protocol = new Protocol();
      const buffer = await window.ipcRenderer.invoke("getChubuPmtiles");
      const fileSource: FileSource = {
        file: buffer as unknown as File,
        getKey: () => "chubu.pmtiles",
        getBytes: async (offset, length) => {
          return {
            data: buffer.buffer.slice(offset, offset + length),
          };
        },
      };
      const p = new PMTiles(fileSource);
      protocol.add(p);
      addProtocol("pmtiles", protocol.tile);

      const initializedMap = new Map({
        container: containerEl,
        style: protomapsBasemapsJson as StyleSpecification,
        center: [137.120435, 34.990565],
        zoom: 14,
        maxZoom: 22,
        minZoom: 6,
      });

      initializedMap.on("load", () => {
        setMapInstance(initializedMap);
      });
    };

    void initializeMap();

    return () => {
      removeProtocol("pmtiles");
    };
  }, []);

  useEffect(
    function updateMapEffect() {
      if (!mapInstance || !selectedDate) return;
      let ignore = false;
      const batchSize = 1000;

      switch (type) {
        case "building":
          {
            const setBuildingMapCenter = async (): Promise<void> => {
              void window.ipcRenderer.invoke("getChubuPmtiles");
              const result = await window.ipcRenderer.invoke(
                "fetchBuildingsInBatches",
                {
                  dataSetResultId,
                  referenceDate: selectedDate,
                  batchSize: 1,
                },
              );

              if (!result?.length) return;

              const [firstItem] = result;
              const coordinates: Polygon["coordinates"] = JSON.parse(
                firstItem.geometry,
              );
              const center: [number, number] = [
                coordinates[0][0][0],
                coordinates[0][0][1],
              ];

              mapInstance.setCenter(center);
            };

            const addBuildingLayers = async (): Promise<void> => {
              let lastId = 0;

              try {
                // eslint-disable-next-line no-constant-condition -- 無限ループでデータを全量取得する
                while (true) {
                  if (ignore) break;

                  const batch = await window.ipcRenderer.invoke(
                    "fetchBuildingsInBatches",
                    {
                      dataSetResultId,
                      referenceDate: selectedDate,
                      batchSize,
                      lastId,
                    },
                  );

                  if (!batch) {
                    throw new Error("Network response was not ok");
                  }

                  const layerId = lastId.toString();
                  const filteredBatch: BuildingProperties[] = batch.map(
                    (building) => ({
                      geometry: building.geometry,
                      predicted_probability: building.predicted_probability,
                      normalized_address: building.normalized_address,
                      household_size: building.household_size,
                      members_under_15: building.members_under_15,
                      members_15_to_64: building.members_15_to_64,
                      members_over_65: building.members_over_65,
                      total_water_usage: building.total_water_usage,
                      water_disconnection_flag:
                        building.water_disconnection_flag,
                      registration_date: building.registration_date,
                      structure_name: building.structure_name,
                    }),
                  );
                  addBuildingLayer(mapInstance, layerId, filteredBatch);
                  setLayerIds((prevLayerIds) =>
                    prevLayerIds ? [...prevLayerIds, layerId] : [layerId],
                  );

                  if (batch.length < batchSize) {
                    // 最後のバッチを取得完了
                    break;
                  }

                  lastId = batch[batch.length - 1].id;
                  await new Promise((resolve) => setTimeout(resolve, 10));
                }
              } catch (error) {
                console.error("Error fetching data: ", error);
              }
            };

            void addBuildingLayers();
            void setBuildingMapCenter();
          }
          break;

        case "area":
          {
            const setAreaMapCenter = async (): Promise<void> => {
              const result = await window.ipcRenderer.invoke(
                "fetchAreasInBatches",
                {
                  dataSetResultId,
                  referenceDate: selectedDate,
                  batchSize: 1,
                },
              );

              if (!result?.length) return;

              const [firstItem] = result;
              const coordinates: Polygon["coordinates"] = JSON.parse(
                firstItem.geometry,
              );
              const center: [number, number] = [
                coordinates[0][0][0],
                coordinates[0][0][1],
              ];

              mapInstance.setCenter(center);
            };

            const addAreaLayers = async (): Promise<void> => {
              let lastId = 0;

              try {
                // eslint-disable-next-line no-constant-condition -- 無限ループでデータを全量取得する
                while (true) {
                  if (ignore) break;

                  const batch = await window.ipcRenderer.invoke(
                    "fetchAreasInBatches",
                    {
                      dataSetResultId,
                      referenceDate: selectedDate,
                      batchSize,
                      lastId,
                    },
                  );

                  if (!batch) {
                    throw new Error("Network response was not ok");
                  }

                  const layerId = lastId.toString();
                  addAreaLayer(mapInstance, layerId, batch);
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

            void setAreaMapCenter();
            void addAreaLayers();
          }
          break;

        default: {
          const exhaustiveCheck: never = type;
          throw new Error(`Unhandled type: ${exhaustiveCheck}`);
        }
      }

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
    },
    [dataSetResultId, mapInstance, selectedDate, type],
  );

  useEffect(
    function applyFiltersEffect() {
      if (!mapInstance || !layerIds?.length) return;

      const allFalse =
        !vacancyLevels.low && !vacancyLevels.medium && !vacancyLevels.high;
      if (allFalse) {
        for (const layerId of layerIds) {
          mapInstance.setLayoutProperty(layerId, "visibility", "none");
        }
        return;
      }

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

        const mapLibreFilter = ["any", ...filters] as FilterSpecification;

        mapInstance.setLayoutProperty(layerId, "visibility", "visible");
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
