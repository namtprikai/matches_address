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
import { _dummyData } from "./_dummy-data";

// レベルごとの色設定
const colors = {
  low: "rgba(0, 255, 0, 0.2)",
  medium: "rgba(255, 255, 0, 0.2)",
  high: "rgba(255, 0, 0, 0.2)",
};

interface Props {
  vacancyLevels: VacancyLevels;
}

export function MapComponent({ vacancyLevels }: Props): JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupData, setPopupData] = useState<BuildingInfo | null>(null);

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
        const features = _dummyData[level as keyof typeof _dummyData].map(
          ({ buildingInfo, coordinates }) => {
            const polygonFeature = new Feature({
              geometry: new Polygon([
                coordinates.map((coord) => fromLonLat(coord)),
              ]),
            });
            polygonFeature.setProperties({ buildingInfo });
            polygonFeature.setStyle(
              new Style({
                fill: new Fill({
                  color: colors[level as keyof typeof colors],
                }),
                stroke: new Stroke({
                  color: colors[level as keyof typeof colors].replace(
                    "0.2",
                    "1",
                  ),
                  width: 2,
                }),
              }),
            );
            return polygonFeature;
          },
        );

        const vectorSource = new VectorSource({
          features,
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
        const buildingInfo = feature.get("buildingInfo") as BuildingInfo;
        setPopupData(buildingInfo);
        popupOverlay.setPosition(coordinate);
      } else {
        popupOverlay.setPosition(undefined);
        setPopupData(null);
      }
    });

    return () => map.setTarget(undefined);
  }, [vacancyLevels]);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
      <Popup ref={popupRef} data={popupData} />
    </div>
  );
}

interface BuildingInfo {
  occupancyRate: string;
  address: string;
  householdInfo: {
    totalPopulation: number;
    ageGroups: {
      under14: number;
      between15And64: number;
      over65: number;
    };
  };
  waterInfo: {
    usage: string;
    status: string;
  };
  buildingInfo: {
    constructionDate: string;
    structureName: string;
  };
}
interface PopupProps {
  data: BuildingInfo | null;
}

const Popup = forwardRef<HTMLDivElement, PopupProps>(({ data }, ref) => {
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
        <span>{data?.occupancyRate}</span>
        <span>×</span>
      </div>
      <div>{data?.address}</div>
      <div>
        <h3>世帯情報</h3>
        <div>
          <span>世帯人数</span>
          <span>{data?.householdInfo.totalPopulation}人</span>
        </div>
        <div>
          <span>〜14歳</span>
          <span>{data?.householdInfo.ageGroups.under14}人</span>
        </div>
        <div>
          <span>15-64歳</span>
          <span>{data?.householdInfo.ageGroups.between15And64}人</span>
        </div>
        <div>
          <span>65歳〜</span>
          <span>{data?.householdInfo.ageGroups.over65}人</span>
        </div>
      </div>
      <div>
        <h3>水道情報</h3>
        <div>
          <span>水道使用量</span>
          <span>{data?.waterInfo.usage}</span>
        </div>
        <div>
          <span>水道使用状況</span>
          <span>{data?.waterInfo.status}</span>
        </div>
      </div>
      <div>
        <h3>建物情報</h3>
        <div>
          <span>築年月</span>
          <span>{data?.buildingInfo.constructionDate}</span>
        </div>
        <div>
          <span>構造名称</span>
          <span>{data?.buildingInfo.structureName}</span>
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
});

Popup.displayName = "Popup";
