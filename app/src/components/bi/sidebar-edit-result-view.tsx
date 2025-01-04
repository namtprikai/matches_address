import {
  makeStyles,
  tokens,
  SearchBox,
  InlineDrawer,
  DrawerHeaderTitle,
  DrawerHeader,
  DrawerBody,
  Spinner,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { Suspense, useEffect, useState } from "react";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { selectedResultSheetIdAtom } from "../../state/selected-result-sheet-id-atom";
import { Button } from "../ui/button";
import { ListDataSetResults } from "../list-data-set-results";
import { Field } from "../ui/field";
import { Select } from "../ui/select";
import { FormEditResultView } from "./form-edit-result-view";
import { EditResultViewLayoutSort } from "./edit-result-view-layout-sort";

const useStyles = makeStyles({
  drawer: {
    minHeight: "100vh",
  },
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  drawerBodyInner: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
  isAddView: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
  },
});

export const SidebarEditResultView = (): JSX.Element => {
  const styles = useStyles();
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);

  const { data: dataSetResults } = useFetchDataSetResults();

  /** データセットを選択 */
  const [selectedDataSetId, setSelectedDataSetId] = useState<string>("");
  useEffect(() => {
    if (dataSetResults) {
      setSelectedDataSetId(String(dataSetResults[0]?.id));
    }
  }, [dataSetResults]);
  /** */

  return (
    <InlineDrawer className={styles.drawer} open>
      <DrawerHeader>
        <DrawerHeaderTitle className={styles.heading}>
          ビューの設定
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <Field label="データセットを選択">
          <Select
            onChange={(e) => setSelectedDataSetId(e.target.value)}
            value={selectedDataSetId}
          >
            {dataSetResults?.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.title || "タイトルなし"}
              </option>
            ))}
          </Select>
        </Field>

        <div className={styles.drawerBodyInner}>
          <Suspense>
            <FormEditResultView selectedResultSheetId={selectedResultSheetId} />
            <EditResultViewLayoutSort />
          </Suspense>
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};

function AddView(): JSX.Element {
  const styles = useStyles();
  const { data: dataSetResults, mutate } = useFetchDataSetResults();
  const numberOfDataSets = dataSetResults?.length || 0;
  const [isLoading, setIsLoading] = useState(false);
  const startCreating = (): void => {
    console.info("Start creating dummy data set results!");
    setIsLoading(true);
  };
  const finishCreating = async (): Promise<void> => {
    console.info("Finish creating dummy data set results🎉");
    await mutate();
    setIsLoading(false);
  };

  return (
    <>
      <div className={styles.isAddView}>
        <SearchBox />
        <div>
          <span className={styles.heading}>データセット一覧</span>
          <ListDataSetResults dataSetResults={dataSetResults} />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gap: 8,
          background: "#eee",
          padding: 4,
        }}
      >
        <div>
          <h4>開発用のデータセットを追加</h4>
          <small>※実際には表示されません</small>
        </div>
        <Button
          disabled={isLoading}
          onClick={async () => {
            startCreating();
            await window.ipcRenderer
              .invoke("createDummyDataSetResults", {
                full: true,
                title: `分析結果(32万件)-${numberOfDataSets + 1}`,
              })
              .then(finishCreating);
          }}
          size="small"
        >
          32万件のデータセットを追加(最大)
        </Button>
        <Button
          disabled={isLoading}
          onClick={async () => {
            startCreating();
            await window.ipcRenderer
              .invoke("createDummyDataSetResults", {
                full: false,
                title: `分析結果(3.2万件)-${numberOfDataSets + 1}`,
              })
              .then(finishCreating);
          }}
          size="small"
        >
          3.2万件のデータセットを追加
        </Button>
        <Button
          disabled={isLoading}
          onClick={async () => {
            startCreating();
            await window.ipcRenderer
              .invoke("createDataSetResults", {
                title: `分析結果(軽量版)-${numberOfDataSets + 1}`,
              })
              .then(finishCreating);
          }}
          size="small"
        >
          軽量版のデータセットを追加
        </Button>
        {isLoading ? (
          <div>
            <Spinner />
            データセットをインポート中...
            <br />
            読み込みが終わるまでお待ちください
          </div>
        ) : null}
      </div>
    </>
  );
}
