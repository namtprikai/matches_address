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

export function MapComponent(): JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupCloserRef = useRef<HTMLAnchorElement | null>(null);
  const [hdms, setHdms] = useState("");

  useEffect(() => {
    const mapEl = mapRef.current;
    const popupEl = popupRef.current;
    const popupCloserEl = popupCloserRef.current;
    if (!mapEl || !popupEl || !popupCloserEl) return;

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
        center: fromLonLat([139.767, 35.6814]),
        zoom: 10,
      }),
    });

    // ポリゴンの追加
    const polygonCoordinates = [
      [139.75, 35.68],
      [139.78, 35.68],
      [139.78, 35.7],
      [139.75, 35.7],
      [139.75, 35.68],
    ].map((coord) => fromLonLat(coord));

    const polygonFeature = new Feature({
      geometry: new Polygon([polygonCoordinates]),
    });

    polygonFeature.setStyle(
      new Style({
        fill: new Fill({
          color: "rgba(255, 0, 0, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ff0000",
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

    // ポップアップを閉じる処理
    popupCloserEl.onclick = () => {
      popupOverlay.setPosition(undefined);
      popupCloserEl.blur();
      return false;
    };

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
      <div
        ref={popupRef}
        style={{
          position: "absolute",
          backgroundColor: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #cccccc",
          bottom: "12px",
          left: "-50px",
          minWidth: "280px",
        }}
      >
        <a
          ref={popupCloserRef}
          href="#"
          style={{
            textDecoration: "none",
            position: "absolute",
            top: "2px",
            right: "8px",
          }}
        >
          ×
        </a>
        <div>{hdms}</div>
      </div>
    </div>
  );
}
