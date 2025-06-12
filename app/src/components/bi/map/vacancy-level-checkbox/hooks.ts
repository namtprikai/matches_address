import { useState } from "react";
import { type View } from "../../../../bi-modules/interfaces/view";
import { type VacancyLevel, type VacancyLevels } from "./types";

type Params = {
  unit: View["unit"];
};

export type UseVacancyLevelCheckboxReturn = {
  vacancyLevels: VacancyLevels;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  labels: Record<VacancyLevel, string>;
};

export const useVacancyLevelCheckbox = ({
  unit,
}: Params): UseVacancyLevelCheckboxReturn => {
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) =>
    setVacancyLevels({
      ...vacancyLevels,
      [event.target.name]: event.target.checked,
    });

  const labels: Record<VacancyLevel, string> =
    unit === "building"
      ? {
          low: "0~29%",
          medium: "30~79%",
          high: "80%~",
        }
      : {
          low: "0~3%",
          medium: "4~10%",
          high: "11%~",
        };

  return {
    vacancyLevels,
    handleChange,
    labels,
  };
};
