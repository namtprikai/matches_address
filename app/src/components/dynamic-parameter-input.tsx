import { getChartFieldOption } from "../utils/get-chart-field-option";
import { Select } from "./ui/select";
import { DynamicColumnOptions } from "./dynamic-column-options";
import { Field } from "./ui/field";

type Props = {
  unit: "building" | "area";
  style: "map" | "table" | "line" | "bar" | "pie";
  fieldKey: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  name: string;
};

/**
 *
 *
 *
 * @param label Fieldのラベル
 * @param unit `building` か``area``のどちらか集計単位
 * @returns
 */
export const DynamicParameterInput = ({
  unit,
  style,
  fieldKey,
  value,
  name,
  onChange,
}: Props): JSX.Element => {
  const fieldOption = getChartFieldOption(style, fieldKey);

  if (!fieldOption) return <></>;

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
