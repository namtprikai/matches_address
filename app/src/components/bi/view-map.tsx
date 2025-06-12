import { useMemo } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { type MapView } from "../../bi-modules/interfaces/view";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { TextWithTooltip } from "../ui/text-with-tooltip";
import { VacancyLevelCheckbox } from "./map/vacancy-level-checkbox";
import { MapComponent } from "./map/map-component";
import { ReferenceDateDropdown } from "./map/reference-date-dropdown";
import { useVacancyLevelCheckbox } from "./map/vacancy-level-checkbox/hooks";
import { useReferenceDateDropdown } from "./map/reference-date-dropdown/hooks";
import { useMapInit } from "./map/map-component/hooks/use-map-init";
import { useUpdateLayerEffect } from "./map/map-component/hooks/use-update-layer-effect";

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
  },
});

interface Props {
  view: MapView;
}

export function Map({ view }: Props): JSX.Element {
  const { unit } = view;

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
      <div className={styles.map}>
        <MapComponent
          mapInitState={mapInitState}
          selectedDate={referenceDateDropdown.selectedDate}
          updateLayerEffectState={updateLayerEffectState}
          vacancyLevels={vacancyLevelCheckboxState.vacancyLevels}
          view={view}
        />
      </div>
    </div>
  );
}
