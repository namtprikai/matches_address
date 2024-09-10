import { useFieldArray, useFormContext } from "react-hook-form";
import { Dialog, DialogTrigger } from "@fluentui/react-components";
import { z } from "zod";
import { result_views, type SelectResultView } from "../schema";
import { LanguageMap } from "../lang";
import { RESULT_VIEW_CONFIG } from "../config/result-view-config";
import { getResultViewFieldOption } from "../utils/get-view-field-option";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogActions } from "./ui/dialog-actions";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DynamicParameterInput } from "./dynamic-parameter-input";

const schema = z.object({
  title: z.string().max(255).optional(),
  unit: z.enum(result_views.unit.enumValues).default("building"),
  style: z.enum(result_views.style.enumValues).default("map"),
  parameters: z
    .object({
      key: z.string(),
      value: z.string(),
    })
    .array(),
});

type EditResultViewFormType = z.infer<typeof schema>;

export const EditResultViewFileds = (): JSX.Element => {
  const { register, watch, control, setValue } =
    useFormContext<EditResultViewFormType>();

  const style = watch("style");
  const unit = watch("unit");

  const { fields, replace, update } = useFieldArray({
    control,
    name: "parameters",
  });

  const resetParametersByStyle = (style: SelectResultView["style"]): void => {
    if (!style) return;
    const option = RESULT_VIEW_CONFIG[style];
    if (!option) return;
    replace(option.fields.map((field) => ({ key: field.key, value: "" })));
  };

  return (
    <>
      <button hidden type="submit" />
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
        {fields.map((field, index) => {
          const fieldOption = getResultViewFieldOption(style, field.key);

          if (!fieldOption) return null;

          if (fieldOption.type === "select") {
            return (
              <DynamicParameterInput
                type={fieldOption.type}
                {...register(`parameters.${index}.value`)}
                key={field.id}
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
                fieldOption={fieldOption}
                onChange={(e) => {
                  update(index, {
                    key: field.key,
                    value: e.target.value,
                  });
                }}
                unit={unit}
                value={field.value}
              />
            );
          }

          if (fieldOption.type === "dropdown") {
            return (
              <DynamicParameterInput
                type={fieldOption.type}
                {...register(`parameters.${index}.value`)}
                key={field.id}
                // @ts-expect-error TODO: この辺りの型定義は別途修正が必要
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
                  });
                }}
                unit={unit}
                value={field.value}
              />
            );
          }

          return <></>;
        })}

        {RESULT_VIEW_CONFIG[style] &&
          RESULT_VIEW_CONFIG[style].grouping.enabled && (
            <Dialog>
              <DialogTrigger>
                <Button size="medium">グループを編集</Button>
              </DialogTrigger>
              <DialogSurface>
                <DialogTitle>グループを編集</DialogTitle>
                <DialogBody>
                  <p>グループを編集</p>
                </DialogBody>
                <DialogActions>
                  <Button>保存</Button>
                </DialogActions>
              </DialogSurface>
            </Dialog>
          )}
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
      {/** 開発用のため後で削除する  */}
      <Button size="medium" type="submit">
        パラーメーター反映(開発用)
      </Button>
    </>
  );
};
