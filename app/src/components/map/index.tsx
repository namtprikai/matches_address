import { useState } from "react";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";
import { _dummyBuildingData } from "./_dummy-data";
import { DisplayPeriodDropdown } from "./display-period-dropdown";

export function Map(): JSX.Element {
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  const [selectedYear, setSelectedYear] = useState<number>(
    _dummyBuildingData[0].year,
  );

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
              years={_dummyBuildingData.map((data) => data.year)}
            />
          </div>
        </div>
      </div>
      <MapComponent
        data={_dummyBuildingData}
        selectedYear={selectedYear}
        vacancyLevels={vacancyLevels}
      />
    </div>
  );
}
