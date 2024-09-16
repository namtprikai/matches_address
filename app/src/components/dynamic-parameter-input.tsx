import { type ForwardedRef, forwardRef } from "react";
import { type DropdownProps } from "@fluentui/react-components";
import { type TileViewFieldOption } from "../@types/charts";
import {
  DATA_SET_DETAIL_AREA_COLUMN_CONFIG,
  DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG,
} from "../config/column-list";
import { Select } from "./ui/select";
import { DynamicColumnOptions } from "./dynamic-column-options";
import { Field } from "./ui/field";
import { Dropdown } from "./ui/dropdown";

type Props = {
  unit: "building" | "area";
  value: string;
  name: string;
} & (
  | {
      type: "select";
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      fieldOption: Omit<TileViewFieldOption, "type"> & { type: "select" };
    }
  | {
      type: "dropdown";
      onChange: DropdownProps["onOptionSelect"];
      multiple: boolean;
      fieldOption: Omit<TileViewFieldOption, "type"> & { type: "dropdowwn" };
    }
  | {
      type: "input";
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      fileldOption: Omit<TileViewFieldOption, "type"> & { type: "input" };
    }
);

/**
 * @param unit `building` か``area``のどちらか集計単位
 * @returns
 */
export const DynamicParameterInput = forwardRef<
  HTMLSelectElement | HTMLButtonElement,
  Props
>((props, ref): JSX.Element => {
  if (props.type === "select") {
    return (
      <Field label={props.fieldOption.label}>
        {props.type === "select" && (
          <Select
            ref={ref as ForwardedRef<HTMLSelectElement>}
            name={props.name}
            onChange={props.onChange}
            value={props.value}
          >
            <option value="">選択してください</option>
            <DynamicColumnOptions
              fieldOption={props.fieldOption}
              type={props.type}
              unit={props.unit}
            />
          </Select>
        )}
      </Field>
    );
  }

  if (props.type === "dropdown") {
    const displayValue =
      props.value !== ""
        ? props.unit === "building"
          ? props.value
              .split(",")
              // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
              .map((v) => DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[v].label)
              .join(",")
          : props.value
              .split(",")
              // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
              .map((v) => DATA_SET_DETAIL_AREA_COLUMN_CONFIG[v].label)
              .join(",")
        : "";

    return (
      <Field label={props.fieldOption.label}>
        <Dropdown
          ref={ref as ForwardedRef<HTMLButtonElement>}
          multiselect={props.multiple}
          name={props.name}
          onOptionSelect={props.onChange}
          selectedOptions={props.value.split(",")}
          value={displayValue} //表示用の値としてしか使われない（Controlledなため）
        >
          <DynamicColumnOptions
            fieldOption={props.fieldOption}
            type={props.type}
            unit={props.unit}
          />
        </Dropdown>
      </Field>
    );
  }

  return <></>;
});

DynamicParameterInput.displayName = "DynamicParameterInput";
