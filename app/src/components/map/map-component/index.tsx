import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { addProtocol, Map, Popup } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { renderToString } from "react-dom/server";
import { makeStyles } from "@fluentui/react-components";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import { BuildingPopup } from "./building-popup";

export const VACANCY_RATE_HIGH = 80;
export const VACANCY_RATE_MEDIUM = 30;

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
    height: "800px",
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

  useEffect(function initializeMap() {
    if (!containerRef.current) return;
    const protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);

    const initializedMap = new Map({
      container: containerRef.current,
      style: "protomaps-basemaps.json",
      center: [137.1513, 35.0816],
      zoom: 15,
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
      const yearData = data.find((value) => value.year === selectedYear);
      const filteredDataByVacancyRate = yearData?.buildings.filter(
        (building) => {
          const vacancyRate = building.vacancyRate;
          if (vacancyRate >= VACANCY_RATE_HIGH) {
            return vacancyLevels.high;
          } else if (vacancyRate >= VACANCY_RATE_MEDIUM) {
            return vacancyLevels.medium;
          } else {
            return vacancyLevels.low;
          }
        },
      );

      if (!filteredDataByVacancyRate) return;

      const sourceId = "buildings";
      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: filteredDataByVacancyRate.map(
            ({ coordinates, ...rest }) => ({
              type: "Feature",
              properties: {
                ...rest,
              },
              geometry: {
                type: "Polygon",
                coordinates,
              },
            }),
          ),
        },
      });

      const layerId = "buildings-layer";
      mapInstance.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": [
            "case",
            [">=", ["get", "vacancyRate"], VACANCY_RATE_HIGH],
            "#C4314B66", // 赤 (80以上)
            [">=", ["get", "vacancyRate"], VACANCY_RATE_MEDIUM],
            "#FFA92966", // 黄 (30以上80未満)
            "#1B8C6366", // 青 (30未満)
          ],
          "fill-outline-color": [
            "case",
            [">=", ["get", "vacancyRate"], VACANCY_RATE_HIGH],
            "#C4314B", // 赤 (80以上)
            [">=", ["get", "vacancyRate"], VACANCY_RATE_MEDIUM],
            "#FFA929", // 黄 (30以上80未満)
            "#1B8C63", // 青 (30未満)
          ],
        },
      });

      let popup: Popup | null = null;

      // ポリゴンレイヤーをクリックしたときのイベントリスナーを追加
      mapInstance.on("click", layerId, (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties as Omit<
            Building,
            "coordinates"
          >;
          const coordinates = e.lngLat;

          // ポップアップの内容を作成
          const popupContent = renderToString(
            <BuildingPopup data={properties} />,
          );

          // ポップアップを作成して表示
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
      mapInstance,
      selectedYear,
      vacancyLevels.high,
      vacancyLevels.medium,
      vacancyLevels.low,
    ],
  );

  return <div ref={containerRef} className={styles.map} />;
}
