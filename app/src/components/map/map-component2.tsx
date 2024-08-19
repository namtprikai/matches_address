import { useEffect, useRef, useState } from "react";
import { addProtocol, Map, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { renderToString } from "react-dom/server";

export const MapComponent2 = (): JSX.Element | null => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    const protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);

    const initializedMap = new Map({
      container: mapContainer.current,
      style: "protomaps-basemaps.json",
      center: [137.1513, 35.0816],
      zoom: 15,
      maxZoom: 17.99,
      minZoom: 4,
    });

    setMapInstance(initializedMap);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    mapInstance.on("load", () => {
      // eslint-disable-next-line no-console -- Debugging
      console.log("Map loaded");

      // デモ用のポリゴンデータを追加
      mapInstance.addSource("demo-polygons", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                name: "ポリゴン1",
                description: "これはデモ用のポリゴン1です。",
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [137.1513, 35.0816],
                    [137.1613, 35.0816],
                    [137.1613, 35.0916],
                    [137.1513, 35.0916],
                    [137.1513, 35.0816],
                  ],
                ],
              },
            },
            {
              type: "Feature",
              properties: {
                name: "ポリゴン2",
                description: "これはデモ用のポリゴン2です。",
              },
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [137.1413, 35.0716],
                    [137.1513, 35.0716],
                    [137.1513, 35.0816],
                    [137.1413, 35.0816],
                    [137.1413, 35.0716],
                  ],
                ],
              },
            },
          ],
        },
      });

      // ポリゴンレイヤーを追加
      mapInstance.addLayer({
        id: "demo-polygon-layer",
        type: "fill",
        source: "demo-polygons",
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });

      // ポリゴンレイヤーをクリックしたときのイベントリスナーを追加
      mapInstance.on("click", "demo-polygon-layer", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = e.lngLat;

          // ポップアップの内容を作成
          const popupContent = renderToString(
            <>
              <h3>{feature.properties.name}</h3>
              <p>{feature.properties.description}</p>
            </>,
          );

          // ポップアップを作成して表示
          new Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(mapInstance);
        }
      });

      // ポリゴンレイヤーにマウスが乗ったときにカーソルを変更
      mapInstance.on("mouseenter", "demo-polygon-layer", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      // ポリゴンレイヤーからマウスが離れたときにカーソルを元に戻す
      mapInstance.on("mouseleave", "demo-polygon-layer", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    });
  }, [mapInstance]);

  return <div ref={mapContainer} style={{ width: "100%", height: "800px" }} />;
};
