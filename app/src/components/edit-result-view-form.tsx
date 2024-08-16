import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Dialog, DialogTrigger } from "@fluentui/react-components";
import { result_views } from "../schema";
import { LanguageMap } from "../lang";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
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

const schema = z.object({
  title: z.string().max(255).optional(),
  unit: z.enum(result_views.unit.enumValues).default("building"),
  style: z.enum(result_views.style.enumValues).default("map"),
});

type EditResultViewFormType = z.infer<typeof schema>;

const graphOptions = {
  pie: {
    fields: [
      { key: "label", label: "ラベル" },
      { key: "value", label: "値" },
    ],
    grouping: {
      enabled: true,
    },
  },
  bar: {
    fields: [
      { key: "xAxis", label: "X軸" },
      { key: "yAxis", label: "Y軸" },
    ],
    grouping: {
      enabled: true,
    },
  },
  line: {
    fields: [
      { key: "xAxis", label: "X軸" },
      { key: "yAxis", label: "Y軸" },
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
  const { register, handleSubmit, reset, getValues } =
    useForm<EditResultViewFormType>({
      resolver: zodResolver(schema),
    });
  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const [, refresh] = useAtom(resultViewsAtom);

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedResultViewId) return;
    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
        title: data.title?.length === 0 ? undefined : data.title,
        style: data.style,
        unit: data.unit,
      },
    });
    refresh();
    reset({
      title: "",
    });
  });

  const style = getValues("style");

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
          <Select {...register("style")} onBlur={onSubmit}>
            {result_views.style.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_STYLE"][item]}
              </option>
            ))}
          </Select>
        </Field>
        {graphOptions[style] &&
          graphOptions[style].fields.map((field) => (
            <Field key={field.key} label={field.label}>
              <Input placeholder={field.label} />
            </Field>
          ))}

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
    </form>
  );
};
