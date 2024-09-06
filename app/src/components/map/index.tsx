import { useEffect, useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { type data_set_detail_buildings } from "../../schema";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";

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
  dataSetResultsId: number;
  type: "building" | "area";
}

export function Map({ type, dataSetResultsId }: Props): JSX.Element {
  const styles = useStyles();
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  // const [selectedYear, setSelectedYear] = useState<number>(data[0].year);

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
          {/* <div>
            <DisplayPeriodDropdown
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              years={data.map((data) => data.year)}
            />
          </div> */}
        </div>
      </div>
      <div className={styles.map}>
        <MapComponent
          dataSetResultsId={dataSetResultsId}
          type={type}
          // selectedYear={selectedYear}
          vacancyLevels={vacancyLevels}
        />
      </div>
    </div>
  );
}
