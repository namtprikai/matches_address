import { Dropdown, Option } from "@fluentui/react-components";

interface Props {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  years: number[];
}

export function DisplayPeriodDropdown({
  selectedYear,
  setSelectedYear,
  years,
}: Props): JSX.Element {
  return (
    <Dropdown
      defaultValue={selectedYear.toString()}
      onOptionSelect={(_, data) => setSelectedYear(Number(data.optionText))}
    >
      {years.map((year) => (
        <Option key={year} text={year.toString()}>
          {year}
        </Option>
      ))}
    </Dropdown>
  );
}
