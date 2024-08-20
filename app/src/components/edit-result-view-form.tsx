import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Dialog, DialogTrigger } from "@fluentui/react-components";
import { useEffect } from "react";
import { z } from "zod";
import { result_views } from "../schema";
import { LanguageMap } from "../lang";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import {
  DATA_SET_DETAIL_BUILIDNG_COLUMN,
  DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG,
} from "../config/data-columns";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
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

const schema = z.object({
  title: z.string().max(255).optional(),
  unit: z.enum(result_views.unit.enumValues).default("building"),
  style: z.enum(result_views.style.enumValues).default("map"),
  parameters: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
});

type EditResultViewFormType = z.infer<typeof schema>;

const graphOptions = {
  pie: {
    fields: [
      {
        key: "xAxis",
        label: "ラベル",
        type: "select",
        accept: ["string", "date", "integer", "float"],
      },
      {
        key: "yAxis",
        label: "値",
        type: "select",
        accept: ["integer", "float"],
      },
    ],
    grouping: {
      enabled: true,
    },
  },
  bar: {
    fields: [
      {
        key: "xAxis",
        label: "X軸",
        type: "select",
        accept: ["string", "date", "integer", "float"],
      },
      {
        key: "yAxis",
        label: "Y軸",
        type: "select",
        accept: ["string", "date", "integer", "float"],
      },
    ],
    grouping: {
      enabled: true,
    },
  },
  line: {
    fields: [
      {
        key: "xAxis",
        label: "X軸",
        type: "select",
        accept: ["string", "date", "integer", "float"],
      },
      {
        key: "yAxis",
        label: "Y軸",
        type: "select",
        accept: ["string", "date", "integer", "float"],
      },
    ],
    grouping: {
      enabled: false,
    },
  },
  map: {
    fields: [],
    grouping: {
      enabled: false,
    },
  },
  table: {
    fields: [],
    grouping: {
      enabled: false,
    },
  },
} as const;

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
                graphOptions[e.target.value as keyof typeof graphOptions];
              if (!option) return;
              replace(
                option.fields.map((field) => ({ key: field.key, value: "" })),
              );
              setValue("style", e.target.value as keyof typeof graphOptions);
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
          const options = graphOptions[style];
          const optionFields = options ? options.fields : [];
          const optionField = optionFields.find(
            (item) => item.key === field.key,
          );

          if (!optionField) return null;

          return (
            <Field key={field.id} label={optionField.label}>
              <Select
                {...register(`parameters.${index}.value`)}
                onChange={(e) => {
                  update(index, {
                    key: field.key,
                    value: e.target.value,
                  });
                }}
                value={field.value}
              >
                {unit === "building" &&
                  DATA_SET_DETAIL_BUILIDNG_COLUMN.filter((column) => {
                    const matchedType = optionField.accept.filter((type) => {
                      return (
                        DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].type ===
                        type
                      );
                    });

                    if (matchedType.length === 0) return false;

                    return true;
                  }).map((column) => {
                    return (
                      <option key={column} value={column}>
                        {DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].label}
                      </option>
                    );
                  })}
              </Select>
            </Field>
          );
        })}

        {graphOptions[style] && graphOptions[style].grouping.enabled && (
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
      <Button onSubmit={onSubmit} size="medium" type="submit">
        保存(開発用)
      </Button>
    </form>
  );
};
