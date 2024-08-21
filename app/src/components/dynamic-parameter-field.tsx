import { Field, type SelectProps } from "@fluentui/react-components";
import { type Parameter } from "../@types/charts";
import { type ChartColumnType } from "../config/data-columns";
import { Select } from "./ui/select";
import { DynamicColumnOptions } from "./dynamic-column-options";

type Props = {
  label: string;
  unit: "building" | "area";
  optionField: {
    key: string;
    label: string;
    accept: readonly ChartColumnType[];
  };
} & SelectProps;

export const DynamicParameterField = ({
  label,
  unit,
  optionField,
  ...props
}: Props): JSX.Element => {
  return (
    <Field label={label}>
      <Select {...props}>
        <option value="">選択してください</option>
        <DynamicColumnOptions fieldOption={optionField} unit={unit} />
      </Select>
    </Field>
  );
};
