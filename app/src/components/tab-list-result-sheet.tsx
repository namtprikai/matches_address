import { AddFilled } from "@fluentui/react-icons";
import {
  makeStyles,
  type SelectTabEventHandler,
  Tab,
  TabList,
} from "@fluentui/react-components";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { selectedSheetIdAtom } from "../state/selected-sheet-id-atom";
import { resultSheetsAtom } from "../state/result-sheets-atom";
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

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "136px 1fr",
  },
  tabList: {
    overflowX: "scroll",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
});

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
  const styles = useStyles();
  const [resultSheets, refresh] = useAtom(resultSheetsAtom);
  const [, setResultSheetId] = useAtom(selectedSheetIdAtom);

  useEffect(() => {
    if (resultSheets.length === 0) return;

    /** @todo きもいからあとで直す */
    setSelectedValue(resultSheets[0].id);
    setResultSheetId(resultSheets[0].id);
  }, [resultSheets, setResultSheetId, setSelectedValue]);

  return (
    <div className={styles.root}>
      <Button
        appearance="subtle"
        icon={<AddFilled />}
        onClick={async (): Promise<void> => {
          await addResultSheet({
            workbookId,
            fieldsLength: resultSheets.length,
          });
          if (!workbookId) return;
          refresh();
        }}
        shape="square"
      >
        シートを追加
      </Button>
      <TabList
        className={styles.tabList}
        onTabSelect={onTabSelect}
        selectedValue={selectedValue}
      >
        {resultSheets.map((item) => (
          <Tab key={item.id} id={item.title || ""} value={item.id}>
            <ButtonEditableSheetTitle
              resultSheet={{ id: item.id, title: item.title }}
            />
          </Tab>
        ))}
      </TabList>
    </div>
  );
};
