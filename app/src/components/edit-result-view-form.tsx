import { useAtom } from "jotai";
import { FormProvider, useForm } from "react-hook-form";
import { makeStyles } from "@fluentui/react-components";
import { useEffect } from "react";
import { type EditResultViewFormType } from "../@types/form-schema";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { type SelectResultView } from "../schema";
import { useFetchDataSetResultItem } from "../hooks/use-fetch-data-set-result-item";
import { useFetchResultView } from "../hooks/use-fetch-result-view";
import { useFetchResultViews2 } from "../hooks/use-fetch-result-views2";
import { EditResultViewFileds } from "./edit-result-view-fields";
import { EditResultViewFilterFields } from "./edit-result-view-filter-fields";
import { Button } from "./ui/button";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: "24px",
  },
});

export const EditResultViewForm = ({
  selectedResultSheetId,
}: {
  selectedResultSheetId: number | undefined;
}): JSX.Element => {
  const styles = useStyles();
  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const { mutate: mutateResultViews } = useFetchResultViews2({
    sheetId: selectedResultSheetId,
  });
  const { data: selectedResultView } = useFetchResultView({
    resultViewId: selectedResultViewId,
  });
  const { data } = useFetchDataSetResultItem({
    dataSetResultId: selectedResultView?.data_set_result_id,
  });

  const year = selectedResultView?.parameters.find(
    (parameter) => parameter.key === "year" && parameter.type === "filter",
  )?.value;

  const methods = useForm<EditResultViewFormType>({
    defaultValues: {
      title: selectedResultView?.title ?? "",
      style: selectedResultView?.style ?? "map",
      unit: selectedResultView?.unit ?? "building",
      parameters: selectedResultView?.parameters ?? [],
      year: {
        start: year?.start,
        end: year?.end,
      },
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
      year: {
        start: year?.start,
        end: year?.end,
      },
      areas: [],
    });
  }, [selectedResultView, reset, year]);

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedResultViewId) return;

    const parameters = data.parameters;

    /** もっと良い書き方ありそう */
    const yearExcludedParameters = parameters.filter(
      (parameter) => parameter.key !== "year",
    );

    const yearParameter = {
      key: "year",
      value: {
        start: data.year.start,
        end: data.year.end,
      },
      type: "filter",
    };

    await window.ipcRenderer.invoke("updateResultViews", {
      resultViewId: selectedResultViewId,
      value: {
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

  if (!data) return <></>;

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={onSubmit}>
        <EditResultViewFileds dataSetTitle={data && data[0].title} />
        <EditResultViewFilterFields />
        <Button appearance="primary" type="submit">
          入力内容を保存する
        </Button>
      </form>
    </FormProvider>
  );
};
