import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke } from "ol/style";
import Polygon from "ol/geom/Polygon";
import Overlay from "ol/Overlay";
import { toStringHDMS } from "ol/coordinate";
import { Popup } from "./popup";
import { type VacancyLevels } from "./vacancy-level-checkbox";

interface Props {
  vacancyLevels: VacancyLevels;
}

export function MapComponent({ vacancyLevels }: Props): JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [hdms, setHdms] = useState("");

  useEffect(() => {
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

    const map = new Map({
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

    // レベルごとのレイヤーを作成
    Object.entries(vacancyLevels).forEach(([level, isVisible]) => {
      if (isVisible) {
        const coordinates = polygonData[level as keyof typeof polygonData].map(
          (coord) => fromLonLat(coord),
        );
        const polygonFeature = new Feature({
          geometry: new Polygon([coordinates]),
        });

        polygonFeature.setStyle(
          new Style({
            fill: new Fill({
              color: colors[level as keyof typeof colors],
            }),
            stroke: new Stroke({
              color: colors[level as keyof typeof colors].replace("0.2", "1"),
              width: 2,
            }),
          }),
        );

        const vectorSource = new VectorSource({
          features: [polygonFeature],
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
        });

        map.addLayer(vectorLayer);
      }
    });

    // ポリゴンレイヤーをクリックしたらポップアップを表示する
    map.on("singleclick", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature,
      );

      if (feature) {
        const coordinate = event.coordinate;
        const hdms = toStringHDMS(toLonLat(coordinate));
        setHdms(hdms);
        popupOverlay.setPosition(coordinate);
      } else {
        popupOverlay.setPosition(undefined);
      }
    });

    return () => map.setTarget(undefined);
  }, [vacancyLevels]);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
      <Popup ref={popupRef} data={{ hdms }} />
    </div>
  );
}

// レベルごとのポリゴンデータ（サンプル）
const polygonData = {
  low: [
    [137.13, 35.07],
    [137.15, 35.07],
    [137.15, 35.08],
    [137.13, 35.08],
    [137.13, 35.07],
  ],
  medium: [
    [137.15, 35.07],
    [137.17, 35.07],
    [137.17, 35.08],
    [137.15, 35.08],
    [137.15, 35.07],
  ],
  high: [
    [137.14, 35.08],
    [137.16, 35.08],
    [137.16, 35.09],
    [137.14, 35.09],
    [137.14, 35.08],
  ],
};

// レベルごとの色設定
const colors = {
  low: "rgba(0, 255, 0, 0.2)",
  medium: "rgba(255, 255, 0, 0.2)",
  high: "rgba(255, 0, 0, 0.2)",
};
