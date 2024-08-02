import { useFieldArray, useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type data_set_results } from "../schema";
import { type form_workbook_edit_schema } from "../zod/form_workbook_edit";
import { Button } from "./button";

type FormType = z.infer<typeof form_workbook_edit_schema>;

type Props = {
  dataSetResults: (typeof data_set_results.$inferSelect)[];
  selectedValue: number;
};

/** 開発用 */
const addDataSetResult = async (
  dataSetResults: (typeof data_set_results.$inferSelect)[],
): Promise<void> => {
  await window.ipcRenderer.invoke("insertDataSetResults", {
    title: `分析結果${dataSetResults.length + 1}`,
  });
};

export const DataSetResults = ({
  dataSetResults,
  selectedValue,
}: Props): JSX.Element => {
  const { control } = useFormContext<FormType>();
  const { append } = useFieldArray({
    control,
    name: `resultsheetsWithViews.${selectedValue}.result_views`,
  });

  return (
    <>
      <div>
        {dataSetResults.map((item) => (
          <div key={item.id}>
            <Button
              appearance="subtle"
              onClick={(): void => {
                append({
                  sheet_id: selectedValue,
                  data_set_result_id: item.id,
                  title: "",
                  unit: "area",
                });
              }}
            >
              {item.title}
            </Button>
          </div>
        ))}
      </div>
      <div>
        <Button
          appearance="subtle"
          onClick={(): void => {
            addDataSetResult(dataSetResults).catch;
          }}
          size="small"
        >
          データセットを追加(開発用)
        </Button>
      </div>
    </>
  );
};
