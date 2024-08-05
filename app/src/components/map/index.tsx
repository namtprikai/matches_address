import { useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";

export function Map(): JSX.Element {
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });

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
            <Dropdown>
              {[2024, 2023, 2022, 2021].map((year) => (
                <Option key={year} text={year.toString()}>
                  {year}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>
      <MapComponent vacancyLevels={vacancyLevels} />
    </div>
  );
}
