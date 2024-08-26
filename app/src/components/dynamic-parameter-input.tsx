import { getResultViewFieldOption } from "../utils/get-view-field-option";
import { type ResultViewFieldOption } from "../@types/charts";
import { Select } from "./ui/select";
import { DynamicColumnOptions } from "./dynamic-column-options";
import { Field } from "./ui/field";

type Props = {
  unit: "building" | "area";
  value: string;
  name: string;
  fieldOption: ResultViewFieldOption;
} & {
  type: "select";
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * @param unit `building` か``area``のどちらか集計単位
 * @returns
 */
export const DynamicParameterInput = ({
  unit,
  fieldOption,
  value,
  name,
  onChange,
}: Props): JSX.Element => {
  return (
    <Field label={fieldOption.label}>
      {fieldOption.type === "select" && (
        <Select name={name} onChange={onChange} value={value}>
          <option value="">選択してください</option>
          <DynamicColumnOptions fieldOption={fieldOption} unit={unit} />
        </Select>
      )}
    </Field>
  );
};
