import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Dialog, DialogTrigger } from "@fluentui/react-components";
import { useEffect } from "react";
import { z } from "zod";
import { result_views } from "../schema";
import { LanguageMap } from "../lang";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { RESULT_VIEW_CONFIG } from "../config/result-view-config";
import { type Parameter } from "../@types/charts";
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

export const EditResultViewForm = (): JSX.Element => {
  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const [selectedResultView, refresh] = useAtom(selectedResultViewAtom);

  const { register, handleSubmit, watch, reset, control, setValue } =
    useForm<EditResultViewFormType>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: selectedResultView?.title ?? "",
        style: selectedResultView?.style ?? "map",
        unit: selectedResultView?.unit ?? "building",
        parameters: (selectedResultView?.parameters as Parameter[]) ?? [],
      },
    });

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedResultViewId) return;
    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
        title: data.title?.length === 0 ? undefined : data.title,
        style: data.style,
        unit: data.unit,
        parameters: data.parameters,
      },
    });
    refresh();
  });

  const style = watch("style");
  const unit = watch("unit");

  const { fields, replace, update } = useFieldArray({
    control,
    name: "parameters",
  });

  useEffect(() => {
    reset({
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: (selectedResultView?.parameters as Parameter[]) ?? [],
    });
  }, [selectedResultView, reset]);

  return (
    <form onSubmit={onSubmit}>
      <button hidden type="submit" />
      <Field label="データセット">
        <Input disabled placeholder="選択中のデータセット名が入る" />
      </Field>
      <Field label="ビューのタイトル">
        <Input
          placeholder="選択中のビューのタイトルを入力する"
          {...register("title")}
          onBlur={onSubmit}
        />
      </Field>
      <Fieldset>
        <FieldLegend>パラメーター</FieldLegend>
        <Field label="スタイル">
          <Select
            {...register("style")}
            onChange={(e) => {
              const option =
                RESULT_VIEW_CONFIG[
                  e.target.value as keyof typeof RESULT_VIEW_CONFIG
                ];
              if (!option) return;
              replace(
                option.fields.map((field) => ({ key: field.key, value: "" })),
              );
              setValue(
                "style",
                e.target.value as keyof typeof RESULT_VIEW_CONFIG,
              );
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

          return (
            <DynamicParameterInput
              type="select"
              {...register(`parameters.${index}.value`)}
              key={field.id}
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
          <Select {...register("unit")} onBlur={onSubmit}>
            {result_views.unit.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_UNIT"][item]}
              </option>
            ))}
          </Select>
        </Field>
      </Fieldset>
      {/** 開発用のため後で削除する  */}
      <Button onSubmit={onSubmit} size="medium" type="submit">
        保存(開発用)
      </Button>
    </form>
  );
};
