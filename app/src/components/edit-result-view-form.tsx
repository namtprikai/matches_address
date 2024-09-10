import { useAtom } from "jotai";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { type EditResultViewFormType } from "../@types/form-schema";
import { editResultViewFormSchema } from "../zod/edit-result-view-form-schema";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { resultViewsAtom } from "../state/result-views-atom";
import { EditResultViewFileds } from "./edit-result-view-fields";
import { EditResultViewFilterFields } from "./edit-result-view-filter-fields";

export const EditResultViewForm = (): JSX.Element => {
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

  useEffect(() => {
    methods.reset({
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: selectedResultView?.parameters ?? [],

      areas: [],
    });
  }, [selectedResultView, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <EditResultViewFileds />
        <EditResultViewFilterFields />
        <button type="submit">保存</button>
      </form>
    </FormProvider>
  );
};
