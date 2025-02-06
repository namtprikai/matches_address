import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { editViewFormSchema } from "../schema/edit-view-form";
import { useFetchResultViews } from "../../hooks/use-fetch-result-views";
import { type EditViewFormType } from "../interfaces/edit-view-form";
import { type SelectResultSheet, type SelectResultView } from "../../schema";
import { useFetchResultView } from "../../hooks/use-fetch-result-view";

type Params = {
  defaultValues: EditViewFormType;
  selectedResultSheetId: SelectResultSheet["id"] | undefined;
  selectedResultViewId: SelectResultView["id"] | undefined;
};

type ReturnType = {
  form: UseFormReturn<EditViewFormType>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  selectedResultView: SelectResultView | undefined;
};

/** WIP */
export const useEditViewForm = ({
  defaultValues,
  selectedResultSheetId,
  selectedResultViewId,
}: Params): ReturnType => {
  const form = useForm<EditViewFormType>({
    resolver: zodResolver(editViewFormSchema),
    defaultValues: {},
  });

  const { mutate: mutateResultViews } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
  const { data: selectedResultView, mutate: mutateResultView } =
    useFetchResultView({
      resultViewId: selectedResultViewId,
    });

  useEffect(
    function resetForm() {
      form.reset(defaultValues);
    },
    [defaultValues, form],
  );

  const onSubmit = form.handleSubmit(async (data) => {
    if (!selectedResultViewId) return;

    const parameters = data.parameters;

    /** もっと良い書き方ありそう */
    const yearExcludedParameters = parameters.filter(
      (parameter) => parameter.key !== "year",
    );

    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
        data_set_result_id: data.dataSetResultId,
        title: data.title?.length === 0 ? undefined : data.title,
        style: data.style,
        unit: data.unit,
        parameters: [
          ...yearExcludedParameters,
        ] as SelectResultView["parameters"], // union の型推論が効きづらいため、明示的に型を指定
      },
    });

    void mutateResultView();
    void mutateResultViews();
  });

  return { form, onSubmit, selectedResultView };
};
