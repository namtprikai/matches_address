import { useParams } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useTabs } from "../../../../hooks/use-tabs";
import { TabListResultSheet } from "../../../../components/tab-list-result-sheet";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { SidebarEditResultView } from "../../../../components/sidebar-edit-result-view";
import { ResultSheet } from "../../../../components/result-sheet";

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

export function EditWorkbook(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });
  const { data: resultSheets } = useFetchResultSheets({ id });

  const tabs = useTabs<number>();
  const { selectedValue } = tabs;

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

          <TabListResultSheet {...tabs} workbookId={id} />
          <div>
            {resultSheets.map((item, index) => (
              <div key={item.id} hidden={selectedValue !== index}>
                <ResultSheet sheetId={item.id} />
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
