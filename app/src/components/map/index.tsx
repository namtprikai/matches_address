import { useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";
import { _dummyBuildingData } from "./_dummy-data";

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
              onChange={setVacancyLevels}
              vacancyLevels={vacancyLevels}
            />
          </div>
        </div>
        <div>
          <div>表示期間</div>
          <div>
            <Dropdown
              defaultValue={selectedYear.toString()}
              onOptionSelect={(_, data) =>
                setSelectedYear(Number(data.optionText))
              }
            >
              {_dummyBuildingData.map(({ year }) => (
                <Option key={year} text={year.toString()}>
                  {year}
                </Option>
              ))}
            </Dropdown>
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
