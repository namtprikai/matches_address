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
import { EditResultViewFilterFields } from "./edit-result-view-filter-fields";
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
              <div>
                <Button
                  onClick={async () => {
                    console.info("Look at your editor console!");
                    await window.ipcRenderer.invoke(
                      "createDummyDataSetResults",
                      { full: true },
                    );
                  }}
                  size="small"
                >
                  開発用のデータセットを追加(フル)
                </Button>
              </div>
              <div>
                <Button
                  onClick={async () => {
                    console.info("Look at your editor console!");
                    await window.ipcRenderer.invoke(
                      "createDummyDataSetResults",
                      { full: false },
                    );
                  }}
                  size="small"
                >
                  開発用のデータセットを追加(1/10)
                </Button>
              </div>
            </>
          )}
          {!isAddView && (
            <>
              <EditResultViewForm />
              <EditResultViewFilterFields />
            </>
          )}
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};
