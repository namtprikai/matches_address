import { AddFilled } from "@fluentui/react-icons";
import {
  type SelectTabEventHandler,
  Tab,
  TabList,
} from "@fluentui/react-components";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { type result_sheets } from "../schema";
import { useFetchResultSheets } from "../hooks/use-fetch-result-sheets";
import { selectedSheetIdAtom } from "../state/selected-sheet-id-atom";
import { Button } from "./button";
import { ButtonEditableSheetTitle } from "./button-editable-sheet-title";

type ResultSheet = typeof result_sheets.$inferSelect;

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

type Props = {
  selectedValue: number;
  onTabSelect?: SelectTabEventHandler | undefined;
  setSelectedValue: React.Dispatch<number>;
  workbookId: string | undefined;
};

export const TabListResultSheet = ({
  onTabSelect,
  selectedValue,
  workbookId,
  setSelectedValue,
}: Props): JSX.Element => {
  const { data: resultSheets } = useFetchResultSheets({ id: workbookId });
  const [selectedSheetId, setResultSheetId] = useAtom(selectedSheetIdAtom);

  useEffect(() => {
    if (resultSheets.length === 0) return;
    setSelectedValue(resultSheets[0].id);
    setResultSheetId(resultSheets[0].id);
  }, [resultSheets, setSelectedValue]);

  return (
    <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
      <Button
        appearance="subtle"
        icon={<AddFilled />}
        onClick={async (): Promise<void> => {
          await addResultSheet({
            workbookId,
            fieldsLength: resultSheets.length,
          });
        }}
        shape="square"
      >
        シートを追加
      </Button>
      {resultSheets.map((item) => (
        <Tab key={item.id} id={item.title || ""} value={item.id}>
          <ButtonEditableSheetTitle
            resultSheet={{ id: item.id, title: item.title }}
          />
        </Tab>
      ))}
    </TabList>
  );
};
