import { useParams } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useFetchWorkbook } from "../hooks/use-fetch-workbook";
import { resultSheetsAtom } from "../state/result-sheets-atom";
import { selectedWorkbookIdAtom } from "../state/selected-workbook-id-atom";
import { selectedSheetIdAtom } from "../state/selected-sheet-id-atom";
import { Button } from "./button";
import { TabListResultSheet } from "./tab-list-result-sheet";
import { SidebarEditResultView } from "./sidebar-edit-result-view";
import { ResultSheet } from "./result-sheet";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
  },
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  headingWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: "1",
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: "100vh",
  },
});

export const EditWorkbookForm = (): JSX.Element => {
  const styles = useStyles();
  const { id } = useParams();
  const [, setSelectedWorkbookId] = useAtom(selectedWorkbookIdAtom);
  setSelectedWorkbookId(Number(id));

  const { data: workbook } = useFetchWorkbook({ id });

  const [resultSheets] = useAtom(resultSheetsAtom);
  const [selectedResultSheetId] = useAtom(selectedSheetIdAtom);

  const onSubmit = (): void => {
    //
  };

  return (
    <form onSubmit={onSubmit}>
      <div className={styles.root}>
        <SidebarEditResultView />

        <div className={styles.content}>
          <div className={styles.headingWithAction}>
            <h2 className={styles.heading}>{workbook?.title}</h2>
            <Button appearance="primary" type="submit">
              保存
            </Button>
          </div>

          <TabListResultSheet />
          <div>
            {resultSheets.map((item) => (
              <div key={item.id} hidden={selectedResultSheetId !== item.id}>
                <ResultSheet />
              </div>
            ))}
          </div>
          <a href={`#analysis/workbook/${id}`}>
            <Button>詳細に戻る</Button>
          </a>
        </div>
      </div>
    </form>
  );
}
