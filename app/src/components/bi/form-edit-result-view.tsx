import { useAtom } from "jotai";
import { FormProvider, useForm } from "react-hook-form";
import { makeStyles } from "@fluentui/react-components";
import { useEffect } from "react";
import { type EditResultViewFormType } from "../../@types/form-schema";
import { selectedResultViewIdAtom } from "../../state/selected-result-view-id-atom";
import { type SelectResultSheet, type SelectResultView } from "../../schema";
import { useFetchResultView } from "../../hooks/use-fetch-result-view";
import { useFetchResultViews } from "../../hooks/use-fetch-result-views";
import { Button } from "../ui/button";
import { EditResultViewFields } from "./edit-result-view-fields";
import { EditResultViewFilterFields } from "./edit-result-view-filter-fields";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: "24px",
  },
});

export const FormEditResultView = ({
  selectedResultSheetId,
}: {
  selectedResultSheetId: number | undefined;
}): JSX.Element | null => {
  const [selectedResultViewId, setSelectedResultViewId] = useAtom(
    selectedResultViewIdAtom,
  );
  const { data: resultViews } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
  const { data: selectedResultView, isLoading: isSelectedResultViewLoading } =
    useFetchResultView({
      resultViewId: selectedResultViewId,
    });
  const selectedYear = selectedResultView?.parameters?.find(
    (parameter) => parameter.key === "year" && parameter.type === "filter",
  )?.value;

  useEffect(() => {
    if (!resultViews || resultViews.length === 0) return;
    const firstView = resultViews.find((view) => view.layoutIndex === 1);
    setSelectedResultViewId((prev) => prev || firstView?.id);
  }, [resultViews, setSelectedResultViewId]);

  if (isSelectedResultViewLoading) {
    return null;
  }

  return (
    <FormComponent
      defaultValues={{
        dataSetResultId: selectedResultView?.data_set_result_id ?? undefined,
        title: selectedResultView?.title ?? "",
        style: selectedResultView?.style ?? "map",
        unit: selectedResultView?.unit ?? "building",
        parameters: selectedResultView?.parameters ?? [],
        year: {
          start: selectedYear?.start,
          end: selectedYear?.end,
        },
        areas: [],
      }}
      selectedResultSheetId={selectedResultSheetId}
      selectedResultViewId={selectedResultViewId}
    />
  );
};

function FormComponent({
  defaultValues,
  selectedResultSheetId,
  selectedResultViewId,
}: {
  defaultValues: EditResultViewFormType;
  selectedResultSheetId: SelectResultSheet["id"] | undefined;
  selectedResultViewId: SelectResultView["id"] | undefined;
}): JSX.Element {
  const styles = useStyles();
  const form = useForm<EditResultViewFormType>({ defaultValues });
  const { mutate: mutateResultViews } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
  const { data: selectedResultView } = useFetchResultView({
    resultViewId: selectedResultViewId,
  });

  console.log("form data", form.getValues());

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

    const yearParameter = {
      key: "year",
      value: {
        start: data.year?.start,
        end: data.year?.end,
      },
      type: "filter",
    };

    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
        data_set_result_id: data.dataSetResultId,
        title: data.title?.length === 0 ? undefined : data.title,
        style: data.style,
        unit: data.unit,
        parameters: [
          ...yearExcludedParameters,
          yearParameter,
        ] as SelectResultView["parameters"], // union の型推論が効きづらいため、明示的に型を指定
      },
    });

    void mutateResultViews();
  });

  return selectedResultView ? (
    <FormProvider {...form}>
      <form className={styles.form} onSubmit={onSubmit}>
        <EditResultViewFields
          dataSetResultId={selectedResultView.data_set_result_id}
        />
        <EditResultViewFilterFields resultView={selectedResultView} />
        <Button appearance="primary" type="submit">
          入力内容を保存する
        </Button>
      </form>
    </FormProvider>
  ) : (
    <>ビューを選択してください</>
  );
}
