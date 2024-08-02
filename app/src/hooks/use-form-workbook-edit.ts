import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { form_workbook_edit_schema } from "../zod/form_workbook_edit";
import { useFetchResultSheets } from "./use-fetch-result-sheets";
import { useFetchResultViews } from "./use-fetch-result-views";

type FormType = z.infer<typeof form_workbook_edit_schema>;

export const useFormWorkbookEdit = ({
  workbookId,
  selectedSheetId,
}: {
  workbookId: string | undefined;
  selectedSheetId: number;
}): {
  formMethods: UseFormReturn<FormType>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
} => {
  const formMethods = useForm<FormType>({
    resolver: zodResolver(form_workbook_edit_schema),
  });
  const { setValue, watch, handleSubmit } = formMethods;

  /** データの取得系のロジック */
  /** fetchしてきたシート情報をformにセット */
  const { data: resultsheets } = useFetchResultSheets({ id: workbookId });
  useEffect(() => {
    setValue(
      "resultsheetsWithViews",
      resultsheets.map((sheet) => ({
        sheet_id: sheet.id,
        sheet_title: sheet.title || "",
        result_views: [],
        is_add_view: true,
      })),
    );
  }, [resultsheets, setValue]);

  /** view情報 */
  const { data: resultViews } = useFetchResultViews({
    sheetId: watch(`resultsheetsWithViews.${selectedSheetId}.sheet_id`),
  });
  useEffect(() => {
    setValue(
      `resultsheetsWithViews.${selectedSheetId}.result_views`,
      resultViews.map((view) => ({
        sheet_id:
          view.sheet_id || 0 /** @fixme ここで || 0 とかせずにすむ方法求む */,
        data_set_result_id:
          view.data_set_result_id ||
          0 /** @fixme ここで || 0 とかせずにすむ方法求む */,
        title: view.title || "",
        unit: view.unit || "area",
      })),
    );
  }, [resultViews, selectedSheetId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    // await window.ipcRenderer.invoke("insertResultViews", {
    //   sheet_id: sheetId,
    //   data_set_result_id: dataSetResultId,
    // });
  });

  return {
    formMethods,
    onSubmit,
  };
};
