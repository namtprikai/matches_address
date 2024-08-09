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
import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { type VacancyLevels } from "../vacancy-level-checkbox";

export type BuildingData = {
  year: number;
  buildings: Building[];
}[];

interface Building {
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

export type AreaData = {
  year: number;
  areas: Area[];
}[];

interface Area {
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
  const [zoom, setZoom] = useState<number | undefined>(12);
  console.log("zoom", zoom);

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

    initialMap.getView().on("change:resolution", () => {
      const roundedZoomLevel = Math.round(initialMap.getView().getZoom() || 0);
      setZoom(roundedZoomLevel);
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

const usePopupStyles = makeStyles({
  container: {
    position: "absolute",
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    bottom: "4px",
    left: "8px",
    minWidth: "280px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#1B8C631F",
    padding: "20px 16px 12px",
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  circleIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
  },
  close: {
    position: "absolute",
    fontSize: "24px",
    top: "15px",
    right: "15px",
    cursor: "pointer",
    color: "#8A8A8A",
  },
  vacancyRate: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  address: {
    color: "#666",
    fontSize: "12px",
  },
  info: {
    padding: "12px 20px 20px",
    "& > div + div": {
      marginTop: "12px",
    },
  },
  heading: {
    color: "#333",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    borderBottom: "1px solid #E0E0E0",
    lineHeight: "2",
  },
  itemLabel: {
    color: "#8A8A8A",
  },
  itemValue: {
    color: "#242424",
  },
  square: {
    width: "24px",
    height: "24px",
    marginRight: "10px",
    borderRadius: "4px",
    display: "inline-block",
  },
  householdIcon: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },
  waterIcon: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
  },
  buildingIcon: {
    backgroundColor: tokens.colorPaletteDarkOrangeBackground2,
  },
  otherIcon: {
    backgroundColor: "#738298",
  },
  low: {
    color: tokens.colorPaletteGreenBackground3,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteGreenBackground3,
    },
  },
  medium: {
    color: tokens.colorPaletteYellowBackground3,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteYellowBackground3,
    },
  },
  high: {
    color: tokens.colorPaletteRedBackground3,
    backgroundColor: tokens.colorPaletteRedBackground1,
    "& > span": {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
  },
});

interface BuildingPopupProps {
  buildingInfo: Building["info"] | null;
  onClose: () => void;
}

const BuildingPopup = forwardRef<HTMLDivElement, BuildingPopupProps>(
  ({ buildingInfo, onClose }, ref) => {
    const styles = usePopupStyles();
    const vacancyRateColorStyle = (() => {
      if (!buildingInfo) return "";
      const vacancyRate = buildingInfo.vacancyRate;
      if (vacancyRate >= 80) {
        return styles.high;
      } else if (vacancyRate >= 30) {
        return styles.medium;
      } else {
        return styles.low;
      }
    })();

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <span className={styles.close} onClick={onClose}>
          ×
        </span>
        <div className={mergeClasses(styles.header, vacancyRateColorStyle)}>
          <span className={mergeClasses(styles.circleIcon)} />
          <div>
            <span className={styles.vacancyRate}>
              {buildingInfo?.vacancyRate}%
            </span>
            <div className={styles.address}>{buildingInfo?.address}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span
                className={mergeClasses(styles.square, styles.householdIcon)}
              />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>世帯人数</span>
              <span className={styles.itemValue}>
                {buildingInfo?.totalPopulation}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>〜14歳</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.under14}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>15-64歳</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.between15And64}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>65歳〜</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.over65}人
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={mergeClasses(styles.square, styles.waterIcon)} />
              水道情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用量</span>
              <span className={styles.itemValue}>
                {buildingInfo?.waterUsage}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用状況</span>
              <span className={styles.itemValue}>
                {buildingInfo?.waterStatus}
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span
                className={mergeClasses(styles.square, styles.buildingIcon)}
              />
              建物情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>築年月</span>
              <span className={styles.itemValue}>
                {buildingInfo?.constructionDate}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>構造名称</span>
              <span className={styles.itemValue}>
                {buildingInfo?.structureName}
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={mergeClasses(styles.square, styles.otherIcon)} />
              その他
            </h3>
            <div className={styles.item}>
              <span>災害避難経路等の情報表示</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BuildingPopup.displayName = "BuildingPopup";

interface AreaPopupProps {
  areaInfo: Area["info"] | null;
  onClose: () => void;
}

const AreaPopup = forwardRef<HTMLDivElement, AreaPopupProps>(
  ({ areaInfo, onClose }, ref) => {
    const styles = usePopupStyles();
    const riskRateColorStyle = (() => {
      if (!areaInfo) return "";
      const riskRate = areaInfo.vacancyRate;
      if (riskRate >= 80) {
        return styles.high;
      } else if (riskRate >= 30) {
        return styles.medium;
      } else {
        return styles.low;
      }
    })();

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <span className={styles.close} onClick={onClose}>
          ×
        </span>
        <div className={`${styles.header} ${riskRateColorStyle}`}>
          <span className={styles.circleIcon} />
          <div>
            <span className={styles.vacancyRate}>{areaInfo?.vacancyRate}%</span>
            <div className={styles.address}>{areaInfo?.address}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.householdIcon}`} />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>世帯数</span>
              <span className={styles.itemValue}>
                {areaInfo?.totalPopulation}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>男性人数</span>
              <span className={styles.itemValue}>
                {areaInfo?.malePopulation}人 (
                {(
                  ((areaInfo?.malePopulation || 0) /
                    (areaInfo?.totalPopulation || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>女性人数</span>
              <span className={styles.itemValue}>
                {areaInfo?.femalePopulation}人 (
                {(
                  ((areaInfo?.femalePopulation || 0) /
                    (areaInfo?.totalPopulation || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>平均年齢</span>
              <span className={styles.itemValue}>
                {areaInfo?.averageAge.toFixed(2)}歳
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.waterIcon}`} />
              水道情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用量平均</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageAverage}L
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最大水道使用量</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageMax}L
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最小水道使用量</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageMin}L
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.buildingIcon}`} />
              建築情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>平均築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.averageConstructionAge}年
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最小築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.minConstructionAge}年
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最大築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.maxConstructionAge}年
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.otherIcon}`} />
              その他
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>空き家調査結果での危険度</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>A</span>
              <span className={styles.itemValue}>
                {areaInfo?.vacantHouseRiskLevels.A}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>B</span>
              <span className={styles.itemValue}>
                {areaInfo?.vacantHouseRiskLevels.B}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>C</span>
              <span className={styles.itemValue}>
                {areaInfo?.vacantHouseRiskLevels.C}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>面積</span>
              <span className={styles.itemValue}>
                {areaInfo?.area.toLocaleString()}㎡
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AreaPopup.displayName = "AreaPopup";
