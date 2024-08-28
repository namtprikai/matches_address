import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { addProtocol, Map, Popup } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { renderToString } from "react-dom/server";
import { makeStyles } from "@fluentui/react-components";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import { addGeoJsonLayer, addGeoJsonSource, useGeoJsonData } from "./utils";
import { BuildingPopup } from "./building-popup";

export interface Building {
  vacancyRate: number;
  address: string;
  totalPopulation: number;
  under14: number;
  between15And64: number;
  over65: number;
  waterUsage: string;
  waterStatus: string;
  constructionDate: string;
  structureName: string;
  coordinates: number[][][];
}

export interface Area {
  vacancyRate: number;
  address: string;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  averageAge: number;
  waterUsageAverage: number;
  waterUsageMax: number;
  waterUsageMin: number;
  averageConstructionAge: number;
  minConstructionAge: number;
  maxConstructionAge: number;
  riskLevelA: number;
  riskLevelB: number;
  riskLevelC: number;
  area: number;
  coordinates: number[][][];
}

export type BuildingData = {
  year: number;
  buildings: Building[];
}[];

export type AreaData = {
  year: number;
  areas: Area[];
}[];

const useMapComponentStyles = makeStyles({
  map: {
    width: "100%",
    height: "600px",
  },
});

interface Props {
  data: BuildingData;
  selectedYear: number;
  vacancyLevels: VacancyLevels;
}

export function MapComponent({
  data,
  selectedYear,
  vacancyLevels,
}: Props): JSX.Element {
  const styles = useMapComponentStyles();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const geoJsonData = useGeoJsonData(vacancyLevels);

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
  }, []);

  useEffect(
    function updateMap() {
      if (!mapInstance) return;
      if (!geoJsonData) return;

      const sourceId = "buildings";
      const layerId = "buildings-layer";
      addGeoJsonSource(mapInstance, sourceId, geoJsonData);
      addGeoJsonLayer(mapInstance, layerId, sourceId);
      let popup: Popup | null = null;
      mapInstance.on("click", layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties;
          const coordinates = e.lngLat;
          const popupContent = renderToString(
            <BuildingPopup
              data={{
                // デモデータ
                address: "東京都千代田区丸の内1-1-1",
                totalPopulation: 1000,
                under14: 200,
                between15And64: 600,
                over65: 200,
                waterUsage: "1000L",
                waterStatus: "良好",
                constructionDate: "2000年",
                structureName: "RC造",
                vacancyRate: properties?.predicted_probability,
              }}
            />,
          );

          popup = new Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(mapInstance);
        }
      });

      // ポリゴンレイヤーにマウスが乗ったときにカーソルを変更
      mapInstance.on("mouseenter", layerId, () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      // ポリゴンレイヤーからマウスが離れたときにカーソルを元に戻す
      mapInstance.on("mouseleave", layerId, () => {
        mapInstance.getCanvas().style.cursor = "";
      });

      return () => {
        popup?.remove(); // FIXME: ポップアップが消えないで残る場合がある
        mapInstance.removeLayer(layerId);
        mapInstance.removeSource(sourceId);
      };
    },
    [
      data,
      geoJsonData,
      mapInstance,
      selectedYear,
      vacancyLevels.high,
      vacancyLevels.low,
      vacancyLevels.medium,
    ],
  );

  return <div ref={containerRef} className={styles.map} />;
}
