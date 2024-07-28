import { AddFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
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

export function EditWorkbook(): JSX.Element {
    const styles = useStyles();
    const { id } = useParams();

    const [workbook, setWorkbook] = useState<Workbook>();

    const fetchData = async (workbookId : string): Promise<void> => {
      const result = await window.ipcRenderer.invoke("selectWorkbook", { id: Number(workbookId) });
      setWorkbook(result);
    };
  
    useEffect(() => {
      if(!id) return;
      fetchData(id).catch(console.error);
    }, [id]);


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
          <a href={`#analysis/workbook/${id}`}><Button>詳細に戻る</Button></a>
        </div>
      </div>
    );
  }
  