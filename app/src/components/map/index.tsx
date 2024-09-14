import { useEffect, useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
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
}

export function Map({ type, dataSetResultId }: Props): JSX.Element {
  const styles = useStyles();
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  const [referenceDates, setReferenceDates] = useState<string[] | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );

  useEffect(
    function fetchReferenceDatesEffect() {
      const fetchReferenceDates = async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("fetchReferenceDates");
        setReferenceDates(result);
        setSelectedDate(result[0]);
      };

      void fetchReferenceDates();
    },
    [dataSetResultId],
  );

  return (
    <div>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <div>空き家率</div>
          <div>
            <VacancyLevelCheckbox
              setVacancyLevels={setVacancyLevels}
              vacancyLevels={vacancyLevels}
            />
          </div>
        </div>
        <div className={styles.filter}>
          <div>表示期間</div>
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
          dataSetResultId={dataSetResultId}
          selectedDate={selectedDate}
          type={type}
          vacancyLevels={vacancyLevels}
        />
      </div>
    </div>
  );
}
