import { useFieldArray, useFormContext } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";
import { result_views, type SelectResultView } from "../schema";
import { LanguageMap } from "../lang";
import { TILE_VIEW_CONFIG } from "../config/tile-view-config";
import { getResultViewFieldOption } from "../utils/get-view-field-option";
import { type EditResultViewFormType } from "../@types/form-schema";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { DynamicParameterInput } from "./dynamic-parameter-input";
import { EditorGroupingForm } from "./editor-grouping-form";

export const EditResultViewFileds = (): JSX.Element => {
  const { register, watch, control, setValue, formState } =
    useFormContext<EditResultViewFormType>();

  const style = watch("style");
  const unit = watch("unit");

  const { fields, replace, update } = useFieldArray({
    control,
    name: "parameters",
  });

  const resetParametersByStyle = (style: SelectResultView["style"]): void => {
    if (!style) return;
    const option = TILE_VIEW_CONFIG[style];
    if (!option) return;
    replace(
      option.fields.map((field) => ({
        key: field.key,
        value: "",
        type: "column",
      })),
    );
  };

  const groupingFields = fields.filter((field) => {
    if (!field) return false;
    return field.type === "group";
  });

  const columnFields = fields.filter((field) => {
    if (!field) return false;
    return field.type === "column";
  });

  console.log(fields);
  console.log(formState.errors);

  return (
    <>
      <Field label="データセット">
        <Input disabled placeholder="選択中のデータセット名が入る" />
      </Field>
      <Field label="ビューのタイトル">
        <Input
          placeholder="選択中のビューのタイトルを入力する"
          {...register("title")}
        />
      </Field>
      <Fieldset>
        <FieldLegend>パラメーター</FieldLegend>
        <Field label="スタイル">
          <Select
            {...register("style")}
            onChange={(e) => {
              const value = e.target.value as keyof SelectResultView["style"];
              // styleに合わせてparameterをリセット
              resetParametersByStyle(value);
              // スタイルの値を更新
              setValue("style", value);
            }}
          >
            {result_views.style.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_STYLE"][item]}
              </option>
            ))}
          </Select>
        </Field>
        {columnFields.map((field, index) => {
          const fieldOption = getResultViewFieldOption(style, field.key);

          if (!fieldOption) return null;

          if (fieldOption.type === "select") {
            return (
              <Fragment key={field.id}>
                <DynamicParameterInput
                  type={fieldOption.type}
                  {...register(`parameters.${index}.value`)}
                  fieldOption={fieldOption}
                  onChange={(e) => {
                    update(index, {
                      key: field.key,
                      value: e.target.value,
                      type: "column",
                    });
                  }}
                  unit={unit}
                  value={
                    typeof field.value === "number"
                      ? field.value.toString()
                      : typeof field.value === "string"
                        ? field.value
                        : ""
                  }
                />
                {fieldOption?.grouping && (
                  <EditorGroupingForm
                    onSave={(parameters) => {
                      const prevOtherParameters = fields.filter((f) => {
                        if (!f) return false;
                        return !f.key.startsWith("group_");
                      });
                      replace([...prevOtherParameters, ...parameters]);
                    }}
                    parameters={groupingFields}
                  />
                )}
              </Fragment>
            );
          }

          if (fieldOption.type === "dropdown") {
            return (
              <DynamicParameterInput
                type={fieldOption.type}
                {...register(`parameters.${index}.value`)}
                key={field.id}
                fieldOption={fieldOption}
                multiple={fieldOption.multiple ?? false}
                onChange={(_, data) => {
                  // dropdownから返ってくる値が空の場合は何もしない
                  if (data.optionValue === undefined) return;

                  // 更新前の値をカンマ区切りの文字列としてデータクレンジングした上で配列化
                  const prevValue = field.value
                    .split(",")
                    .filter((value) => value !== "");

                  // 更新後の値を生成
                  const newValue = prevValue.includes(data.optionValue)
                    ? prevValue.filter((value) => {
                        return value !== data.optionValue;
                      })
                    : [...prevValue, data.optionValue];

                  update(index, {
                    key: field.key,
                    value: newValue.join(","),
                    type: "column",
                  });
                }}
                unit={unit}
                value={
                  typeof field.value === "number"
                    ? field.value.toString()
                    : typeof field.value === "string"
                      ? field.value
                      : ""
                }
              />
            );
          }

          return <></>;
        })}

        <Field label="集計単位">
          <Select
            {...register("unit")}
            onChange={(e) => {
              // styleに合わせてparameterをリセット
              resetParametersByStyle(style);
              // スタイルの値を更新
              setValue("unit", e.target.value as "building" | "area");
            }}
          >
            {result_views.unit.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_UNIT"][item]}
              </option>
            ))}
          </Select>
        </Field>
      </Fieldset>
    </>
  );
};
