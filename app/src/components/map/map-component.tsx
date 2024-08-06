import { forwardRef, useEffect, useRef, useState } from "react";
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
import { type VacancyLevels } from "./vacancy-level-checkbox";

export type BuildingData = {
  year: number;
  buildings: Building[];
}[];

interface Building {
  info: {
    vacancyRate: string;
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
        const vacancyRate = parseInt(building.info.vacancyRate);
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
        polygonFeature.setProperties({ buildingInfo: building.info });

        const occupancyRate = parseInt(building.info.vacancyRate);
        let color;
        if (occupancyRate >= 80) {
          color = "rgba(0, 255, 0, 0.2)";
        } else if (occupancyRate >= 30) {
          color = "rgba(255, 255, 0, 0.2)";
        } else {
          color = "rgba(255, 0, 0, 0.2)";
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
          const buildingInfo = feature.get("buildingInfo") as Building["info"];
          setPopupData(buildingInfo);
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

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
      <Popup ref={popupRef} buildingInfo={popupData} />
    </div>
  );
}

interface PopupProps {
  buildingInfo: Building["info"] | null;
}

const Popup = forwardRef<HTMLDivElement, PopupProps>(
  ({ buildingInfo }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          backgroundColor: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #cccccc",
          bottom: "4px",
          left: "8px",
          minWidth: "280px",
        }}
        tabIndex={-1}
      >
        <div>
          <span>{buildingInfo?.vacancyRate}</span>
          <span>×</span>
        </div>
        <div>{buildingInfo?.address}</div>
        <div>
          <h3>世帯情報</h3>
          <div>
            <span>世帯人数</span>
            <span>{buildingInfo?.totalPopulation}人</span>
          </div>
          <div>
            <span>〜14歳</span>
            <span>{buildingInfo?.ageGroups.under14}人</span>
          </div>
          <div>
            <span>15-64歳</span>
            <span>{buildingInfo?.ageGroups.between15And64}人</span>
          </div>
          <div>
            <span>65歳〜</span>
            <span>{buildingInfo?.ageGroups.over65}人</span>
          </div>
        </div>
        <div>
          <h3>水道情報</h3>
          <div>
            <span>水道使用量</span>
            <span>{buildingInfo?.waterUsage}</span>
          </div>
          <div>
            <span>水道使用状況</span>
            <span>{buildingInfo?.waterStatus}</span>
          </div>
        </div>
        <div>
          <h3>建物情報</h3>
          <div>
            <span>築年月</span>
            <span>{buildingInfo?.constructionDate}</span>
          </div>
          <div>
            <span>構造名称</span>
            <span>{buildingInfo?.structureName}</span>
          </div>
        </div>
        <div>
          <h3>その他</h3>
          <div>
            <span>災害避難経路等の情報表示</span>
          </div>
        </div>
      </div>
    );
  },
);

Popup.displayName = "Popup";
