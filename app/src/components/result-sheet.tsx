import { Card } from "@fluentui/react-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type result_sheets } from "../schema";
import { type form_workbook_edit_schema } from "../zod/form_workbook_edit";
import { Button } from "./button";

type FormType = z.infer<typeof form_workbook_edit_schema>;

type Props = {
  resultsheetId: (typeof result_sheets.$inferSelect)["id"];
};

export const Resultsheet = ({ resultsheetId }: Props): JSX.Element => {
  const { control } = useFormContext<FormType>();
  const { fields } = useFieldArray({
    control,
    name: `resultsheetsWithViews.${resultsheetId}.result_views`,
  });
  return (
    <div>
      <div>
        {fields.length === 0 && <p>ビューがありません</p>}
        {fields.map((resultView) => (
          <Card
            key={resultView.id}
          >{`ID:${resultView.data_set_result_id} / title:${resultView.title || "--"}`}</Card>
        ))}
      </div>
      <Button appearance="primary">保存</Button>
    </div>
  );
};
