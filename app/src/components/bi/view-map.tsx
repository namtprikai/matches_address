import { useMemo } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { type MapView } from "../../bi-modules/interfaces/view";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { TextWithTooltip } from "../ui/text-with-tooltip";
import { type AreaFilter } from "../../bi-modules/interfaces/parameter";
import { VacancyLevelCheckbox } from "./map/vacancy-level-checkbox";
import { MapComponent } from "./map/map-component";
import { ReferenceDateDropdown } from "./map/reference-date-dropdown";
import { useVacancyLevelCheckbox } from "./map/vacancy-level-checkbox/hooks";
import { useReferenceDateDropdown } from "./map/reference-date-dropdown/hooks";
import { useMapInit } from "./map/map-component/hooks/use-map-init";
import { useUpdateLayerEffect } from "./map/map-component/hooks/use-update-layer-effect";
import { QueryHeader, QueryHeaderWrapper } from "./query-header";
import { useMapAllCount } from "./map/map-component/hooks/use-map-all-count";
import { useSetMapCenterEffect } from "./map/map-component/hooks/use-set-map-center-effect";
import { MapCenterButtons } from "./map/map-component/map-center-buttons";

const useStyles = makeStyles({
  filters: {
    display: "flex",
    gap: tokens.spacingHorizontalXXL,
  },
  filter: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  map: {
    marginTop: tokens.spacingVerticalMNudge,
    position: "relative",
  },
});

interface Props {
  view: MapView;
  isPreview?: boolean; // プレビュー用のフラグ
}

export function Map({ view, isPreview }: Props): JSX.Element {
  const { unit, dataSetResultId, parameters } = view;

  const styles = useStyles();

  const mapInitState = useMapInit();

  const vacancyLevelCheckboxState = useVacancyLevelCheckbox({
    unit,
  });
  const referenceDateDropdown = useReferenceDateDropdown({
    dataSetResultId: view.dataSetResultId,
  });

  const updateLayerEffectState = useUpdateLayerEffect({
    mapInstance: mapInitState.mapInstance,
    selectedDate: referenceDateDropdown.selectedDate,
    view,
  });

  const areaFilter = parameters.find((p) => p.key === "area");
  const setMapCenterEffect = useSetMapCenterEffect({
    resultViewId: view.id,
    mapInstance: mapInitState.mapInstance,
    getGeometryParams: {
      unit,
      dataSetResultId,
      selectedDate: referenceDateDropdown.selectedDate,
      areas:
        areaFilter?.value as AreaFilter["value"] /** [todo]なぜこの指定なのかわからないので注意 */,
    },
    clearPopup: updateLayerEffectState.clearPopup,
  });

  const { allCount } = useMapAllCount({
    dataSetResultId: view.dataSetResultId,
    unit,
  });

  /** マップに表示される指標 */
  const meta = useMemo(
    () =>
      unit === "area"
        ? AREA_DATASET_COLUMN_METADATA["predicted_probability"]
        : BUILDING_DATASET_COLUMN_METADATA["predicted_probability"],
    [unit],
  );

  return (
    <div>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <div>
            <TextWithTooltip
              textNode={meta.label}
              tooltipContent={meta.description}
            />
          </div>
          <div>
            <VacancyLevelCheckbox {...vacancyLevelCheckboxState} />
          </div>
        </div>
        <div className={styles.filter}>
          <div>推定日</div>
          <div>
            <ReferenceDateDropdown {...referenceDateDropdown} />
          </div>
        </div>
      </div>
      <QueryHeaderWrapper>
        <QueryHeader
          allCount={allCount || 0}
          totalCount={updateLayerEffectState.features?.length || 0}
        />
      </QueryHeaderWrapper>
      <div className={styles.map}>
        <MapCenterButtons isPreview={isPreview} {...setMapCenterEffect} />
        <MapComponent
          mapInitState={mapInitState}
          updateLayerEffectState={updateLayerEffectState}
          vacancyLevels={vacancyLevelCheckboxState.vacancyLevels}
          view={view}
        />
      </div>
    </div>
  );
}
