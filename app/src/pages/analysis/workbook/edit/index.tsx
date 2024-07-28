import { useEffect } from "react";
import { AddFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { Button } from "../../../../components/Button";
import { useFetchWorkbook } from "../../../../hooks/useFetchWorkbook";
import { useFetchResultSheets } from "../../../../hooks/useFetchResultSheets";
import { useTabs } from "../../../../hooks/useTabs";

const useStyles = makeStyles({
    root: {
      overflow: "hidden",
      display: "flex",
    },
    heading: {
      fontSize: tokens.fontSizeBase500,
      lineHeight: tokens.lineHeightBase600,
    },
    content: {
      flex: "1",
      padding: tokens.spacingVerticalL,
      backgroundColor: tokens.colorNeutralBackground3,
      minHeight: "100vh",
    },
    resultsheets: {
      padding: tokens.spacingVerticalL,
    }
  });

export function EditWorkbook(): JSX.Element {
    const styles = useStyles();
    const { id } = useParams();

    const { data: workbook } = useFetchWorkbook({ id });
    const { data: resultsheets, refetch: fetchResultSheets } = useFetchResultSheets({ id });
    const {onTabSelect, selectedValue, setSelectedValue} = useTabs();

    /** fixme: シート追加したあとも0番目に戻ってしまうの微妙かも */
    useEffect(() => {
      setSelectedValue(resultsheets[0]?.id);
    },[resultsheets, setSelectedValue]);

    const addResultSheet = async (workbookId : string | undefined): Promise<void> => {
      if(!workbookId) return;
      await window.ipcRenderer.invoke("insertResultSheets", {
        title: `シート${resultsheets.length + 1}`,
        workbook_id: Number(workbookId),
      });
      await fetchResultSheets(workbookId).catch(console.error);
    }

    return (
      <div className={styles.root}>
        <InlineDrawer open>
          <DrawerHeader>
            <DrawerHeaderTitle action={<Button icon={<AddFilled />} shape="square" />}>
              ビューを追加
            </DrawerHeaderTitle>
          </DrawerHeader>

          <DrawerBody>
            <p>Drawer content</p>
          </DrawerBody>
        </InlineDrawer>
        <div className={styles.content}>
          <h2 className={styles.heading}>{workbook?.title}</h2>

          <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
            <Button appearance="subtle" icon={<AddFilled />} onClick={():Promise<void>=>addResultSheet(id)} shape="square">シートを追加</Button>
            {resultsheets.map((item) => (
              <Tab key={item.id} id={item.title || ""} value={item.id}>
                {item.title}
              </Tab>
            ))}
          </TabList>
          <div>
            {
              resultsheets.map((item) => (
                <div key={item.id} className={styles.resultsheets} hidden={selectedValue !== item.id}>
                  コンテンツ: {item.title}
                </div>
              ))
            }
          </div>
          <a href={`#analysis/workbook/${id}`}><Button>詳細に戻る</Button></a>
        </div>
      </div>
    );
  }
  