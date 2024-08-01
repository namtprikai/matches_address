import { useEffect } from "react";
import { AddFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  SearchBox,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { Button } from "../../../../components/Button";
import { useFetchWorkbook } from "../../../../hooks/useFetchWorkbook";
import { useFetchResultSheets } from "../../../../hooks/useFetchResultSheets";
import { useTabs } from "../../../../hooks/useTabs";
import { useFetchDataSetResults } from "../../../../hooks/useFetchDataSetResults";
import { Resultsheet } from "../../../../components/Resultsheet";
import { ButtonEditableSheetTitle } from "../../../../components/ButtonEditableSheetTitle";

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
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: "100vh",
  },
  drawerBody: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
  resultsheets: {
    padding: tokens.spacingVerticalL,
  },
});

export function EditWorkbook(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });
  const { data: resultsheets, refetch: fetchResultSheets } =
    useFetchResultSheets({ id });
  const { data: dataSetResults, refetch: fetchDataSetResults } =
    useFetchDataSetResults();
  const { onTabSelect, selectedValue, setSelectedValue } = useTabs();

  /** fixme: シート追加したあとも0番目に戻ってしまうの微妙かも */
  useEffect(() => {
    setSelectedValue(resultsheets[0]?.id);
  }, [resultsheets, setSelectedValue]);

  const addResultSheet = async (
    workbookId: string | undefined,
  ): Promise<void> => {
    if (!workbookId) return;
    await window.ipcRenderer.invoke("insertResultSheets", {
      title: `シート${resultsheets.length + 1}`,
      workbook_id: Number(workbookId),
    });
    await fetchResultSheets(workbookId).catch(console.error);
  };

  const addDataSetResult = async (): Promise<void> => {
    await window.ipcRenderer.invoke("insertDataSetResults", {
      title: `分析結果${dataSetResults.length + 1}`,
    });
    await fetchDataSetResults().catch(console.error);
  };

  return (
    <div className={styles.root}>
      <InlineDrawer open>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={<Button icon={<AddFilled />} shape="square" />}
            className={styles.heading}
          >
            ビューを追加
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className={styles.drawerBody}>
            <div>
              <SearchBox />
            </div>
            <span className={styles.heading}>データセット一覧</span>
            <div>
              {dataSetResults.map((item) => (
                <div key={item.id}>
                  <Button appearance="subtle">{item.title}</Button>
                </div>
              ))}
            </div>
            <div>
              <Button
                appearance="subtle"
                onClick={addDataSetResult}
                size="small"
              >
                データセットを追加(開発用)
              </Button>
            </div>
          </div>
        </DrawerBody>
      </InlineDrawer>
      <div className={styles.content}>
        <h2 className={styles.heading}>{workbook?.title}</h2>

        <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
          <Button
            appearance="subtle"
            icon={<AddFilled />}
            onClick={(): Promise<void> => addResultSheet(id)}
            shape="square"
          >
            シートを追加
          </Button>
          {resultsheets.map((item) => (
            <Tab key={item.id} id={item.title || ""} value={item.id}>
              <ButtonEditableSheetTitle resultSheet={item} />
            </Tab>
          ))}
        </TabList>
        <div>
          {resultsheets.map((item) => (
            <div
              key={item.id}
              className={styles.resultsheets}
              hidden={selectedValue !== item.id}
            >
              <Resultsheet resultsheet={item} />
            </div>
          ))}
        </div>
        <a href={`#analysis/workbook/${id}`}>
          <Button>詳細に戻る</Button>
        </a>
      </div>
    </div>
  );
}
