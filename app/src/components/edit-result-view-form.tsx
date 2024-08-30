import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useEffect } from "react";
import { z } from "zod";
import { data_set_detail_areas, result_views } from "../schema";
import { LanguageMap } from "../lang";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { RESULT_VIEW_CONFIG } from "../config/result-view-config";
import { getResultViewFieldOption } from "../utils/get-view-field-option";
import { resultViewsAtom } from "../state/result-views-atom";
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

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
});

export const EditResultViewForm = (): JSX.Element => {
  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const [selectedResultView, refresh] = useAtom(selectedResultViewAtom);
  const [, refreshResultViews] = useAtom(resultViewsAtom);

  const styles = useStyles();
  const { register, handleSubmit, watch, reset, control, setValue } =
    useForm<EditResultViewFormType>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: selectedResultView?.title ?? "",
        style: selectedResultView?.style ?? "map",
        unit: selectedResultView?.unit ?? "building",
        parameters: selectedResultView?.parameters ?? [],
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
    // resultViewsの再取得を行い、更新されたデータを反映する
    refreshResultViews();
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
      parameters: selectedResultView?.parameters ?? [],
    });
  }, [selectedResultView, reset]);

  const resetParametersByStyle = (
    style: (typeof result_views.$inferSelect)["style"],
  ): void => {
    if (!style) return;
    const option = RESULT_VIEW_CONFIG[style];
    if (!option) return;
    replace(option.fields.map((field) => ({ key: field.key, value: "" })));
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
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
              const value = e.target
                .value as keyof (typeof result_views.$inferSelect)["style"];
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
                onChange={(event, data) => {
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
      <Button onSubmit={onSubmit} size="medium" type="submit">
        パラーメーター反映(開発用)
      </Button>
    </form>
  );
};
