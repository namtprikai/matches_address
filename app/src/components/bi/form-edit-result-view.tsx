import { useAtom } from "jotai";
import { FormProvider } from "react-hook-form";
import { makeStyles } from "@fluentui/react-components";
import { useEffect } from "react";
import { selectedResultViewIdAtom } from "../../state/selected-result-view-id-atom";
import { type SelectResultSheet, type SelectResultView } from "../../schema";
import { useFetchResultView } from "../../hooks/use-fetch-result-view";
import { useFetchResultViews } from "../../hooks/use-fetch-result-views";
import { Button } from "../ui/button";
import { useEditViewForm } from "../../bi-modules/hooks/use-edit-view-form";
import { type EditViewFormType } from "../../bi-modules/interfaces/edit-view-form";
import { ErrorMessage } from "../error-message";
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

  /** ビューの初期値を取得 */
  const { data: selectedResultView, isLoading: isSelectedResultViewLoading } =
    useFetchResultView({
      resultViewId: selectedResultViewId,
    });

  /** ひとつめのViewを選択させておくための処理 */
  const { data: resultViews } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
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

  const { form, selectedResultView, onSubmit } = useEditViewForm({
    defaultValues,
    selectedResultSheetId,
    selectedResultViewId,
  });
  const {
    formState: { errors },
  } = form;

  return selectedResultViewId && selectedResultView ? (
    <FormProvider {...form}>
      <form className={styles.form} onSubmit={onSubmit}>
        {Object.entries(errors).map(([key, error]) => (
          <ErrorMessage
            key={key}
            msg={`【${key}】の設定を確認してください.${error.message}`}
          />
        ))}
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
