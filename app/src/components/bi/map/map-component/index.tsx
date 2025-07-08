import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-gl.css";
import { useEffect } from "react";
import { type FilterSpecification } from "maplibre-gl";
import { makeStyles } from "@fluentui/react-components";
import {
  type VacancyLevel,
  type VacancyLevels,
} from "../vacancy-level-checkbox/types";
import {
  type MapWithTableView,
  type MapView,
} from "../../../../bi-modules/interfaces/view";
import { type MapInitReturn } from "./hooks/use-map-init";
import { type UpdateLayerEffectReturn } from "./hooks/use-update-layer-effect";

export const PREDICTED_PROBABILITY: Record<
  MapView["unit"],
  Record<VacancyLevel, number>
> = {
  building: {
    low: 0,
    medium: 0.3,
    high: 0.8,
  },
  area: {
    low: 0,
    medium: 0.04,
    high: 0.11,
  },
};

const useStyles = makeStyles({
  map: {
    width: "100%",
    height: "600px",
  },
});

type Props = {
  view: MapView | MapWithTableView;
  vacancyLevels: VacancyLevels;
  mapInitState: MapInitReturn;
  updateLayerEffectState: UpdateLayerEffectReturn;
};

export function MapComponent({
  view,
  vacancyLevels,
  mapInitState: { containerRef, mapInstance },
  updateLayerEffectState: { layerIds },
}: Props): JSX.Element {
  const styles = useStyles();

  const { unit } = view;

  useEffect(
    function applyFiltersEffect() {
      if (!mapInstance || !layerIds?.length) return;

      const allFalse =
        !vacancyLevels.low && !vacancyLevels.medium && !vacancyLevels.high;
      if (allFalse) {
        for (const layerId of layerIds) {
          if (!mapInstance.getLayer(layerId)) return;
          mapInstance.setLayoutProperty(layerId, "visibility", "none");
        }
        return;
      }

      for (const layerId of layerIds) {
        if (!mapInstance.getLayer(layerId)) return;
        const filters = [];
        if (vacancyLevels.low) {
          filters.push([
            "<",
            ["get", "predicted_probability"],
            PREDICTED_PROBABILITY[unit].medium,
          ]);
        }
        if (vacancyLevels.medium) {
          filters.push([
            "all",
            [
              ">=",
              ["get", "predicted_probability"],
              PREDICTED_PROBABILITY[unit].medium,
            ],
            [
              "<",
              ["get", "predicted_probability"],
              PREDICTED_PROBABILITY[unit].high,
            ],
          ]);
        }
        if (vacancyLevels.high) {
          filters.push([
            ">=",
            ["get", "predicted_probability"],
            PREDICTED_PROBABILITY[unit].high,
          ]);
        }

        const mapLibreFilter = ["any", ...filters] as FilterSpecification;

        mapInstance.setLayoutProperty(layerId, "visibility", "visible");
        mapInstance.setFilter(layerId, mapLibreFilter);
      }
    },
    [
      layerIds,
      mapInstance,
      unit,
      vacancyLevels.high,
      vacancyLevels.low,
      vacancyLevels.medium,
    ],
  );

  return <div ref={containerRef} className={styles.map} />;
}
