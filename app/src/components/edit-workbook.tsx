import { useParams } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useFetchWorkbook } from "../hooks/use-fetch-workbook";
import { resultSheetsAtom } from "../state/result-sheets-atom";
import { selectedWorkbookIdAtom } from "../state/selected-workbook-id-atom";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { Button } from "./ui/button";
import { TabListEditResultSheet } from "./tab-list-edit-result-sheet";
import { SidebarEditResultView } from "./sidebar-edit-result-view";
import { PreviewResultSheet } from "./preview-result-sheet";

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
  content: {
    flex: "1",
    padding: tokens.spacingHorizontalXXL,
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: "100vh",
    display: "flex",
    flexFlow: "column",
    gap: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  sidebar: {
    minWidth: "320px", // 現状チャート部分は無限に拡大するため、最小値を設定
  },
});

export const EditWorkbook = (): JSX.Element => {
  const styles = useStyles();
  const { id } = useParams();
  const [, setSelectedWorkbookId] = useAtom(selectedWorkbookIdAtom);
  setSelectedWorkbookId(Number(id));

  const { data: workbook } = useFetchWorkbook({ id });

  const [resultSheets] = useAtom(resultSheetsAtom);
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <SidebarEditResultView />
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>{workbook?.title}</h2>

        <TabListEditResultSheet />
        <div>
          {resultSheets.map((item) => (
            <div key={item.id} hidden={selectedResultSheetId !== item.id}>
              <PreviewResultSheet />
            </div>
          ))}
        </div>
        <a href={`#analysis/workbook/${id}`}>
          <Button>詳細に戻る</Button>
        </a>
      </div>
    </div>
  );
};
