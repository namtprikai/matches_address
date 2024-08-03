import { AddFilled } from "@fluentui/react-icons";
import {
  type SelectTabEventHandler,
  Tab,
  TabList,
} from "@fluentui/react-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type form_workbook_edit_schema } from "../zod/form_workbook_edit";
import { Button } from "./button";
import { ButtonEditableSheetTitle } from "./button-editable-sheet-title";

const addResultSheet = async ({
  workbookId,
  fieldsLength,
}: {
  workbookId: string | undefined;
  fieldsLength: number;
}): Promise<void> => {
  if (!workbookId) return;
  await window.ipcRenderer.invoke("insertResultSheets", {
    title: `シート${fieldsLength + 1}`,
    workbook_id: Number(workbookId),
  });
};

type FormType = z.infer<typeof form_workbook_edit_schema>;

type Props = {
  selectedValue: number;
  onTabSelect?: SelectTabEventHandler | undefined;
  workbookId: string | undefined;
};

export const TabListResultSheet = ({
  onTabSelect,
  selectedValue,
  workbookId,
}: Props): JSX.Element => {
  const { control } = useFormContext<FormType>();

  const { fields } = useFieldArray({
    control,
    name: "resultsheetsWithViews",
  });

  return (
    <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
      <Button
        appearance="subtle"
        icon={<AddFilled />}
        onClick={(): Promise<void> =>
          addResultSheet({ workbookId, fieldsLength: fields.length })
        }
        shape="square"
      >
        シートを追加
      </Button>
      {fields.map((item) => (
        <Tab key={item.id} id={item.sheet_title || ""} value={item.sheet_id}>
          <ButtonEditableSheetTitle
            resultSheet={{ id: item.sheet_id, title: item.sheet_title }}
          />
        </Tab>
      ))}
    </TabList>
  );
};
