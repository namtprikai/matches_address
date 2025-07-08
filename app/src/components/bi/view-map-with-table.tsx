import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Button,
  makeStyles,
  tokens,
  type InlineDrawerProps,
  mergeClasses,
  useRestoreFocusSource,
  Switch,
} from "@fluentui/react-components";
import { ArrowResetRegular, Dismiss24Regular } from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import { type MapWithTableView } from "../../bi-modules/interfaces/view";
import { TextWithTooltip } from "../ui/text-with-tooltip";
import {
  AREA_DATASET_COLUMN_METADATA,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { type AreaFilter } from "../../bi-modules/interfaces/parameter";
import { VacancyLevelCheckbox } from "./map/vacancy-level-checkbox";
import { useVacancyLevelCheckbox } from "./map/vacancy-level-checkbox/hooks";
import { ReferenceDateDropdown } from "./map/reference-date-dropdown";
import { useReferenceDateDropdown } from "./map/reference-date-dropdown/hooks";
import { MapComponent } from "./map/map-component";
import { ResultTable } from "./result-table";
import { useMapInit } from "./map/map-component/hooks/use-map-init";
import { useUpdateLayerEffect } from "./map/map-component/hooks/use-update-layer-effect";
import { QueryHeader, QueryHeaderWrapper } from "./query-header";
import { useMapAllCount } from "./map/map-component/hooks/use-map-all-count";
import { useSetMapCenterEffect } from "./map/map-component/hooks/use-set-map-center-effect";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
    gap: tokens.spacingHorizontalXS,
  },

  content: {
    flex: "1",
    overflow: "auto",

    position: "relative",
  },

  flexColumn: {
    flexDirection: "column",
  },

  withViewContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalXXL,
  },
  filters: {
    display: "flex",
    columnGap: tokens.spacingHorizontalXXL,
    rowGap: tokens.spacingVerticalMNudge,
    flexWrap: "wrap",
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
  button: {
    position: "absolute",
    top: tokens.spacingVerticalMNudge,
    left: tokens.spacingHorizontalXXL,
    zIndex: 1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
  },
  indicator: {
    marginLeft: 0,
  },
});

type DrawerTableProps = InlineDrawerProps & {
  setWithTable: (withTable: boolean) => void;
};

const DrawerTable = ({
  setWithTable,
  ...props
}: DrawerTableProps): JSX.Element => {
  const restoreFocusSourceAttributes = useRestoreFocusSource();

  return (
    <InlineDrawer
      {...restoreFocusSourceAttributes}
      {...props}
      position="end"
      style={{ width: "40%" }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={() => setWithTable(false)}
            />
          }
        />
      </DrawerHeader>

      <DrawerBody>{props.children}</DrawerBody>
    </InlineDrawer>
  );
};

type Props = {
  view: MapWithTableView;
};

export const ViewMapWithTable = ({ view }: Props): JSX.Element => {
  const styles = useStyles();

  const { unit, dataSetResultId, parameters } = view;

  const mapInitState = useMapInit();

  const vacancyLevelCheckboxState = useVacancyLevelCheckbox({
    unit,
  });
  const referenceDateDropdown = useReferenceDateDropdown({
    dataSetResultId: view.dataSetResultId,
  });

  const areaFilter = parameters.find((p) => p.key === "area");
  const { resetCenter } = useSetMapCenterEffect({
    mapInstance: mapInitState.mapInstance,
    getGeometryParams: {
      unit,
      dataSetResultId,
      selectedDate: referenceDateDropdown.selectedDate,
      areas:
        areaFilter?.value as AreaFilter["value"] /** [todo]なぜこの指定なのかわからないので注意 */,
    },
  });

  const updateLayerEffectState = useUpdateLayerEffect({
    mapInstance: mapInitState.mapInstance,
    selectedDate: referenceDateDropdown.selectedDate,
    view,
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

  const [withTable, setWithTable] = useState(false);

  return (
    <div className={mergeClasses(styles.root, styles.flexColumn)}>
      <div className={styles.root}>
        <div className={styles.content}>
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
            <div className={styles.filter}>
              <div>表</div>
              <Switch
                checked={withTable}
                indicator={{
                  className: styles.indicator,
                }}
                onChange={(_, data) => {
                  setWithTable(data.checked);
                }}
              />
            </div>
          </div>
          <QueryHeaderWrapper>
            <QueryHeader
              allCount={allCount || 0}
              totalCount={updateLayerEffectState.features?.length || 0}
            />
          </QueryHeaderWrapper>
          <div className={styles.map}>
            <Button
              className={styles.button}
              icon={<ArrowResetRegular />}
              onClick={resetCenter}
            />
            <MapComponent
              mapInitState={mapInitState}
              updateLayerEffectState={updateLayerEffectState}
              vacancyLevels={vacancyLevelCheckboxState.vacancyLevels}
              view={view}
            />
          </div>
        </div>

        <DrawerTable open={withTable} setWithTable={setWithTable}>
          <ResultTable
            mapInitState={mapInitState}
            updateLayerEffectState={updateLayerEffectState}
            view={view}
          />
        </DrawerTable>
      </div>
    </div>
  );
};
