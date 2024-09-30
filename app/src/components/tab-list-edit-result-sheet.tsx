import { AddFilled } from "@fluentui/react-icons";
import { makeStyles, TabList, tokens } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { useFetchResultSheets } from "../hooks/use-fetch-result-sheets";
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

interface Props {
  workbookId: number | undefined;
}

export const TabListEditResultSheet = ({
  workbookId,
}: Props): JSX.Element | null => {
  const styles = useStyles();
  const { data: resultSheets, mutate } = useFetchResultSheets({
    id: workbookId,
  });
  const [selectedResultSheetId, setSelectedResultSheetId] = useAtom(
    selectedResultSheetIdAtom,
  );

  useEffect(() => {
    if (!resultSheets || resultSheets?.length === 0) return;
    setSelectedResultSheetId((prev) => prev || resultSheets[0].id);
  }, [resultSheets, setSelectedResultSheetId]);

  if (!workbookId || !selectedResultSheetId || !resultSheets) return null;

  return (
    <div className={styles.root}>
      <Button
        appearance="subtle"
        icon={<AddFilled />}
        onClick={async () => {
          const { insertedId } = await window.ipcRenderer.invoke(
            "insertResultSheets",
            {
              title: `シート${resultSheets.length + 1}`,
              workbook_id: workbookId,
            },
          );
          void mutate();
          setSelectedResultSheetId(insertedId);
        }}
        shape="square"
      >
        シートを追加
      </Button>
      <TabList
        className={styles.tabList}
        onTabSelect={(_, data) => {
          if (!data.value || typeof data.value !== "number") return;
          setSelectedResultSheetId(data.value);
        }}
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
    </div>
  );
};
