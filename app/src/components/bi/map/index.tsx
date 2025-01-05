import { useEffect, useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useFetchReferenceDates } from "../../../hooks/use-fetch-reference-dates";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";
import { ReferenceDateDropdown } from "./reference-date-dropdown";

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
  dataSetResultId: number;
  type: "building" | "area";
  areas: string[] | undefined;
}

export function Map({ type, dataSetResultId, areas }: Props): JSX.Element {
  const styles = useStyles();
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  const { data: referenceDates } = useFetchReferenceDates({ dataSetResultId });
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    referenceDates?.[0],
  );

  useEffect(
    function fetchReferenceDatesEffect() {
      if (!referenceDates) return;
      setSelectedDate(
        (prevSelectedDate) => prevSelectedDate || referenceDates[0],
      );
    },
    [referenceDates],
  );

  return (
    <div>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <div>空き家確率</div>
          <div>
            <VacancyLevelCheckbox
              setVacancyLevels={setVacancyLevels}
              vacancyLevels={vacancyLevels}
            />
          </div>
        </div>
        <div className={styles.filter}>
          <div>推定日</div>
          <div>
            <ReferenceDateDropdown
              referenceDates={referenceDates}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
      </div>
      <div className={styles.map}>
        <MapComponent
          areas={areas}
          dataSetResultId={dataSetResultId}
          selectedDate={selectedDate}
          type={type}
          vacancyLevels={vacancyLevels}
        />
      </div>
    </div>
  );
}
