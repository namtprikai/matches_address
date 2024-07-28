import { AddFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  type SelectTabData,
  type SelectTabEvent,
  Tab,
  TabList,
  type TabValue,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/Button";

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
  });

  /** [TODO]スキーマから生成できないか確認する */
type Workbook = {
  id: number;
  title: string | null;
  created_at: string | null;
};

type ResultSheet = {
  id: number;
  workbook_id: number | null;
  title: string | null;
  created_at: string | null;
}

export function EditWorkbook(): JSX.Element {
    const styles = useStyles();
    const { id } = useParams();

    /** Workbook */
    const [workbook, setWorkbook] = useState<Workbook>();

    const fetchWorkbook = async (workbookId : string): Promise<void> => {
      const result = await window.ipcRenderer.invoke("selectWorkbook", { id: Number(workbookId) });
      setWorkbook(result);
    };
  
    useEffect(() => {
      if(!id) return;
      fetchWorkbook(id).catch(console.error);
    }, [id]);

    /** ResultSheet */
    const [resultsheets, setResultSheets] = useState<ResultSheet[]>([]);

    const fetchResultSheets = async (workbookId : string): Promise<void> => {
      const result = await window.ipcRenderer.invoke("selectResultSheets", { workbookId: Number(workbookId) });
      setResultSheets(result)
    }

    useEffect(()=>{
      if(!id) return;
      fetchResultSheets(id).catch(console.error);
    },[id]);

    const addResultSheet = async (workbookId : string | undefined): Promise<void> => {
      if(!workbookId) return;
      await window.ipcRenderer.invoke("insertResultSheets", {
        title: `シート${resultsheets.length + 1}`,
        workbook_id: Number(workbookId),
      });
      await fetchResultSheets(workbookId).catch(console.error);
    }

    const [selectedValue, setSelectedValue] =
    useState<TabValue>(resultsheets.length > 0 ? resultsheets[0].id : "");

    const onTabSelect = (event: SelectTabEvent, data: SelectTabData): void => {
      setSelectedValue(data.value);
    };


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
                <div key={item.id} hidden={selectedValue !== item.id}>
                  {item.title}
                  <div style={{
                    height: "400px",
                    width: "100%",
                  }} />
                </div>
              ))
            }
          </div>
          <a href={`#analysis/workbook/${id}`}><Button>詳細に戻る</Button></a>
        </div>
      </div>
    );
  }
  