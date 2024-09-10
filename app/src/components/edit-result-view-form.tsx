import { useAtom } from "jotai";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeStyles } from "@fluentui/react-components";
import { useEffect } from "react";
import { type EditResultViewFormType } from "../@types/form-schema";
import { editResultViewFormSchema } from "../zod/edit-result-view-form-schema";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { resultViewsAtom } from "../state/result-views-atom";
import { EditResultViewFileds } from "./edit-result-view-fields";
import { EditResultViewFilterFields } from "./edit-result-view-filter-fields";
import { Button } from "./ui/button";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: "24px",
  },
});

export const EditResultViewForm = (): JSX.Element => {
  const styles = useStyles();

  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const [selectedResultView, refresh] = useAtom(selectedResultViewAtom);
  const [, refreshResultViews] = useAtom(resultViewsAtom);

  const methods = useForm<EditResultViewFormType>({
    resolver: zodResolver(editResultViewFormSchema),
    defaultValues: {
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: selectedResultView?.parameters ?? [],

      areas: [],
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset({
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: selectedResultView?.parameters ?? [],

      areas: [],
    });
  }, [selectedResultView, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedResultViewId) return;

    const parameters = data.parameters;

    /** もっと良い書き方ありそう */
    const yearExcludedParameters = parameters.filter(
      (parameter) =>
        parameter.key !== "year.start" && parameter.key !== "year.end",
    );

    const startYear = {
      key: "year.start",
      value: data.year.start,
      type: "filter",
    };

    const endYear = {
      key: "year.end",
      value: data.year.end,
      type: "filter",
    };

    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
        title: data.title?.length === 0 ? undefined : data.title,
        style: data.style,
        unit: data.unit,
        parameters: [...yearExcludedParameters, startYear, endYear],
      },
    });
    refresh();
    // resultViewsの再取得を行い、更新されたデータを反映する
    refreshResultViews();
  });

  useEffect(() => {
    reset({
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: selectedResultView?.parameters ?? [],
    });
  }, [selectedResultView, reset]);

  const year = methods.watch("year");

  console.log(year);

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={onSubmit}>
        <EditResultViewFileds />
        <EditResultViewFilterFields />
        <Button type="submit">フィルター・パラメータを保存する</Button>
      </form>
    </FormProvider>
  );
};
