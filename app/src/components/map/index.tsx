import { useState } from "react";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { type BuildingData, MapComponent } from "./map-component";
import { DisplayPeriodDropdown } from "./display-period-dropdown";

interface Props {
  data: BuildingData;
}

export function Map({ data }: Props): JSX.Element {
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  const [selectedYear, setSelectedYear] = useState<number>(data[0].year);

  return (
    <div>
      <div>
        <div>
          <div>空き家率</div>
          <div>
            <VacancyLevelCheckbox
              setVacancyLevels={setVacancyLevels}
              vacancyLevels={vacancyLevels}
            />
          </div>
        </div>
        <div>
          <div>表示期間</div>
          <div>
            <DisplayPeriodDropdown
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              years={data.map((data) => data.year)}
            />
          </div>
        </div>
      </div>
      <MapComponent
        data={data}
        selectedYear={selectedYear}
        vacancyLevels={vacancyLevels}
      />
    </div>
  );
}
