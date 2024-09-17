import { AddFilled } from "@fluentui/react-icons";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  tokens,
  SearchBox,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useFetchDataSetResults } from "../hooks/use-fetch-data-set-results";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { Button } from "./ui/button";
import { EditResultViewForm } from "./edit-result-view-form";
import { ListDataSetResults } from "./list-data-set-results";

const useStyles = makeStyles({
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  drawerBody: {
    minHeight: "100vh",
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
  const { data: dataSetResults } = useFetchDataSetResults();

  const [resultViews, refresh] = useAtom(resultViewsAtom);
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);
  const [isAddView, setIsAddView] = useState(resultViews.length === 0);

  /** ビューをデータセット情報と一緒に追加 */
  const addResultView = async ({
    dataSetResultId,
  }: {
    dataSetResultId: number;
  }): Promise<void> => {
    if (resultViews.length === 4) return; /** 最大4つ */
    await window.ipcRenderer.invoke("insertResultViews", {
      data_set_result_id: dataSetResultId,
      sheet_id: selectedResultSheetId,
    });
    refresh();
  };

  useEffect(() => {
    if (resultViews.length === 0) {
      setIsAddView(true);
    } else {
      setIsAddView(false);
    }
  }, [resultViews.length]);

  return (
    <InlineDrawer open>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            isAddView ? undefined : (
              <Button
                disabled={resultViews.length === 4}
                icon={<AddFilled />}
                onClick={(): void => {
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

      <DrawerBody className={styles.drawerBody}>
        <div className={styles.drawerBodyInner}>
          {isAddView && (
            <>
              <div className={styles.isAddView}>
                <SearchBox />

                <div>
                  <span className={styles.heading}>データセット一覧</span>

                  <ListDataSetResults
                    dataSetResults={dataSetResults}
                    onClickItem={(item) =>
                      addResultView({ dataSetResultId: item.id })
                        .catch()
                        .finally(() => setIsAddView(false))
                    }
                  />
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
                  <small>
                    ※実際には表示されません
                    <br />
                    ※ボタンクリック後リロードしてください
                  </small>
                </div>
                <Button
                  onClick={async () => {
                    console.info("Start creating dummy data set results!");
                    await window.ipcRenderer
                      .invoke("createDummyDataSetResults", {
                        full: true,
                        title: `分析結果(32万件)-${dataSetResults.length + 1}`,
                      })
                      .then(() =>
                        console.info(
                          "Finish creating dummy data set results🎉",
                        ),
                      );
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
                        title: `分析結果(3.2万件)-${dataSetResults.length + 1}`,
                      })
                      .then(() =>
                        console.info(
                          "Finish creating dummy data set results🎉",
                        ),
                      );
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
                        title: `分析結果(軽量版)-${dataSetResults.length + 1}`,
                      })
                      .then(() =>
                        console.info(
                          "Finish creating dummy data set results🎉",
                        ),
                      );
                  }}
                  size="small"
                >
                  軽量版のデータセットを追加
                </Button>
              </div>
            </>
          )}
          {!isAddView && <EditResultViewForm />}
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};
