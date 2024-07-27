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
import { Button } from "../../../../components/Button";

const useStyles = makeStyles({
    root: {
      overflow: "hidden",
      display: "flex",
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
          <h2>編集: {id}</h2>
          <a href={`#analysis/workbook/${id}`}><Button>詳細に戻る</Button></a>
        </div>
      </div>
    );
  }
  