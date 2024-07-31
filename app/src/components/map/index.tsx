import { useEffect, useRef } from "react";
import "ol/ol.css";
import OlMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke } from "ol/style";
import Polygon from "ol/geom/Polygon";

export function Map(): JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(function initMap() {
    if (!mapRef.current) return;

    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            attributions:
              '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([139.767, 35.6814]), // 東京の座標
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

    return (): void => map.setTarget(undefined);
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
}
