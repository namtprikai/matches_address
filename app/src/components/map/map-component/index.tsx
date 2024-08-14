import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke } from "ol/style";
import Polygon from "ol/geom/Polygon";
import Overlay from "ol/Overlay";
import { makeStyles } from "@fluentui/react-components";
import { type VacancyLevels } from "../vacancy-level-checkbox";
import { BuildingPopup } from "./building-popup";

export interface Building {
  info: {
    vacancyRate: number;
    address: string;
    totalPopulation: number;
    ageGroups: {
      under14: number;
      between15And64: number;
      over65: number;
    };
    waterUsage: string;
    waterStatus: string;
    constructionDate: string;
    structureName: string;
  };
  coordinates: number[][];
}

export interface Area {
  info: {
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
    vacantHouseRiskLevels: {
      A: number;
      B: number;
      C: number;
    };
    area: number;
  };
  coordinates: number[][];
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
  vacancyLevels: VacancyLevels;
  selectedYear: number;
}

export function MapComponent({
  data,
  selectedYear,
  vacancyLevels,
}: Props): JSX.Element {
  const styles = useMapComponentStyles();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [popupData, setPopupData] = useState<Building["info"] | null>(null);

  useEffect(function initializeMap() {
    const mapEl = mapRef.current;
    const popupEl = popupRef.current;
    if (!mapEl || !popupEl) return;

    const popupOverlay = new Overlay({
      element: popupEl,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    const initialMap = new Map({
      target: mapEl,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            attributions:
              '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
          }),
        }),
      ],
      overlays: [popupOverlay],
      view: new View({
        center: fromLonLat([137.1513, 35.0816]),
        zoom: 12,
      }),
    });

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []);

  useEffect(
    function updateMap() {
      if (!map) return;

      // Remove existing vector layers
      map
        .getLayers()
        .getArray()
        .filter((layer) => layer instanceof VectorLayer)
        .forEach((layer) => map.removeLayer(layer));

      const yearData = data.find((value) => value.year === selectedYear);
      const filteredData = yearData?.buildings.filter((building) => {
        const vacancyRate = building.info.vacancyRate;
        if (vacancyRate >= 80) {
          return vacancyLevels.high;
        } else if (vacancyRate >= 30) {
          return vacancyLevels.medium;
        } else {
          return vacancyLevels.low;
        }
      });
      if (!filteredData) return;

      const features = filteredData.map((building: Building) => {
        const coordinates = building.coordinates.map((coord) =>
          fromLonLat(coord),
        );
        const polygonFeature = new Feature({
          geometry: new Polygon([coordinates]),
        });
        polygonFeature.setProperties({ info: building.info });

        const occupancyRate = building.info.vacancyRate;
        let color;
        if (occupancyRate >= 80) {
          color = "rgba(255, 0, 0, 0.2)";
        } else if (occupancyRate >= 30) {
          color = "rgba(255, 255, 0, 0.2)";
        } else {
          color = "rgba(0, 255, 0, 0.2)";
        }

        polygonFeature.setStyle(
          new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: color.replace("0.2", "1"),
              width: 2,
            }),
          }),
        );

        return polygonFeature;
      });

      const vectorSource = new VectorSource({ features });
      const vectorLayer = new VectorLayer({ source: vectorSource });
      map.addLayer(vectorLayer);

      // ポリゴンレイヤーをクリックしたらポップアップを表示する
      map.on("singleclick", (event) => {
        const feature = map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature,
        );
        if (feature) {
          const info = feature.get("info") as Building["info"];
          setPopupData(info);
          map.getOverlays().item(0).setPosition(event.coordinate);
        } else {
          map.getOverlays().item(0).setPosition(undefined);
          setPopupData(null);
        }
      });
    },
    [
      data,
      map,
      selectedYear,
      vacancyLevels.high,
      vacancyLevels.low,
      vacancyLevels.medium,
    ],
  );

  const handleClose = (): void => {
    if (!map) return;
    map.getOverlays().item(0).setPosition(undefined);
    setPopupData(null);
  };

  return (
    <div>
      <div ref={mapRef} className={styles.map} />
      <BuildingPopup
        ref={popupRef}
        buildingInfo={popupData}
        onClose={handleClose}
      />
    </div>
  );
}
