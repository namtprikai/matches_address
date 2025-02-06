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
import { useEditViewForm } from "../../bi-modules/hooks/use-edit-view-form";
import { type EditViewFormType } from "../../bi-modules/interfaces/edit-view-form";
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
  defaultValues: EditViewFormType;
  selectedResultSheetId: SelectResultSheet["id"] | undefined;
  selectedResultViewId: SelectResultView["id"] | undefined;
}): JSX.Element {
  const styles = useStyles();
  const form = useEditViewForm({
    defaultValues,
    selectedResultSheetId,
    selectedResultViewId,
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
