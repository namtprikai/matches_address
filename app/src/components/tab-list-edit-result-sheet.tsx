import { AddFilled } from "@fluentui/react-icons";
import {
  makeStyles,
  type SelectTabData,
  type SelectTabEvent,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { startTransition, useEffect } from "react";
import { resultSheetsAtom } from "../state/result-sheets-atom";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { selectedWorkbookIdAtom } from "../state/selected-workbook-id-atom";
import { Button } from "./ui/button";
import { ButtonEditableSheetTitle } from "./button-editable-sheet-title";
import { Tab } from "./ui/tab";

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
    gap: tokens.spacingHorizontalM,
  },
});

export const TabListEditResultSheet = (): JSX.Element => {
  const styles = useStyles();
  const [resultSheets, refresh] = useAtom(resultSheetsAtom);
  const [workbookId] = useAtom(selectedWorkbookIdAtom);
  const [selectedResultSheetId, setSelectedResultSheetId] = useAtom(
    selectedResultSheetIdAtom,
  );

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    startTransition(() => setSelectedResultSheetId(data.value as number));
  };

  useEffect(() => {
    if (resultSheets.length === 0) return;
    setSelectedResultSheetId((prev) => prev || resultSheets[0].id);
  }, [resultSheets, setSelectedResultSheetId]);

  return (
    <div className={styles.root}>
      <Button
        appearance="subtle"
        icon={<AddFilled />}
        onClick={async (): Promise<void> => {
          if (!workbookId) return;
          const { insertedId } = await window.ipcRenderer.invoke(
            "insertResultSheets",
            {
              title: `シート${resultSheets.length + 1}`,
              workbook_id: workbookId,
            },
          );
          refresh();
          setSelectedResultSheetId(insertedId);
        }}
        shape="square"
      >
        シートを追加
      </Button>
      {selectedResultSheetId && (
        <TabList
          className={styles.tabList}
          onTabSelect={onTabSelect}
          selectedValue={selectedResultSheetId}
        >
          {resultSheets.map((item) => (
            <Tab key={item.id} id={item.title || ""} value={item.id}>
              <ButtonEditableSheetTitle
                resultSheet={{ id: item.id, title: item.title }}
              />
            </Tab>
          ))}
        </TabList>
      )}
    </div>
  );
};
