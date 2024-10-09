import { AddFilled } from "@fluentui/react-icons";
import {
  makeStyles,
  tokens,
  SearchBox,
  InlineDrawer,
  DrawerHeaderTitle,
  DrawerHeader,
  DrawerBody,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { Suspense, useEffect, useState } from "react";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { useFetchResultViews } from "../../hooks/use-fetch-result-views";
import { selectedResultSheetIdAtom } from "../../state/selected-result-sheet-id-atom";
import { Button } from "../ui/button";
import { ListDataSetResults } from "../list-data-set-results";
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
  const { data: resultViews } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
  const [isAddView, setIsAddView] = useState(true);

  useEffect(() => {
    setIsAddView(resultViews?.length === 0);
  }, [resultViews?.length]);

  return (
    <InlineDrawer className={styles.drawer} open>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            isAddView ? undefined : (
              <Button
                disabled={resultViews?.length === 4}
                icon={<AddFilled />}
                onClick={() => {
                  setIsAddView(true);
                }}
                shape="square"
              />
            )
          }
          className={styles.heading}
        >
          ビューを追加
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.drawerBodyInner}>
          <Suspense>
            {isAddView ? (
              <AddView />
            ) : (
              <>
                <FormEditResultView
                  selectedResultSheetId={selectedResultSheetId}
                />
                <EditResultViewLayoutSort />
              </>
            )}
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
  const finishCreating = (): void => {
    console.info("Finish creating dummy data set results🎉");
    void mutate();
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
          onClick={async () => {
            console.info("Start creating dummy data set results!");
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
          onClick={async () => {
            console.info("Start creating dummy data set results!");
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
          onClick={async () => {
            console.info("Start creating dummy data set results!");
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
      </div>
    </>
  );
}
