import { useEffect, useRef, useState } from "react";
import { addProtocol, Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

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
    mapInstance?.on("load", () => {
      // eslint-disable-next-line no-console -- Debugging
      console.log("Map loaded");
    });
  }, [mapInstance]);

  return <div ref={mapContainer} style={{ width: "100%", height: "800px" }} />;
};
