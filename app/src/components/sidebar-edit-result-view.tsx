import { AddFilled } from "@fluentui/react-icons";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  tokens,
  SearchBox,
  Field,
  Input,
  Select,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useFetchDataSetResults } from "../hooks/use-fetch-data-set-results";
import { type data_set_results, result_views } from "../schema";
import { LanguageMap } from "../lang";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedSheetIdAtom } from "../state/selected-sheet-id-atom";
import { Button } from "./button";

/** 開発用 */
const addDataSetResult = async (
  dataSetResults: (typeof data_set_results.$inferSelect)[],
): Promise<void> => {
  await window.ipcRenderer.invoke("insertDataSetResults", {
    title: `分析結果${dataSetResults.length + 1}`,
  });
};

const useStyles = makeStyles({
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  drawerBody: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
});

export const SidebarEditResultView = (): JSX.Element => {
  const styles = useStyles();
  const { data: dataSetResults } = useFetchDataSetResults();

  const [resultViews, refresh] = useAtom(resultViewsAtom);
  const [selectedSheetId] = useAtom(selectedSheetIdAtom);
  const [isAddView, setIsAddView] = useState(resultViews.length === 0);

  console.log("SidebarEditResultView",{resultViews, selectedSheetId, isAddView})

  /** ビューをデータセット情報と一緒に追加 */
  const addResultView = async ({
    dataSetResultId,
  }: {
    dataSetResultId: number;
  }): Promise<void> => {
    await window.ipcRenderer.invoke("insertResultViews", {
      data_set_result_id: dataSetResultId,
      sheet_id: selectedSheetId,
    });
    refresh();
  };

  useEffect(()=>{
    if(resultViews.length === 0) {
      setIsAddView(true)
    } else {
      setIsAddView(false)
    }
  },[resultViews.length])

  return (
    <InlineDrawer open>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            isAddView ? undefined : (
              <Button
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

      <DrawerBody>
        <div className={styles.drawerBody}>
          {isAddView && (
            <>
              <div>
                <div>
                  <SearchBox />
                </div>
                <span className={styles.heading}>データセット一覧</span>
                {dataSetResults.map((item) => (
                  <div key={item.id}>
                    <Button
                      appearance="subtle"
                      onClick={(): void => {
                        addResultView({ dataSetResultId: item.id })
                          .catch()
                          .finally(() => setIsAddView(false));
                      }}
                    >
                      {item.title}
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <Button
                  appearance="subtle"
                  onClick={(): void => {
                    addDataSetResult(dataSetResults).catch;
                  }}
                  size="small"
                >
                  データセットを追加(開発用)
                </Button>
              </div>
            </>
          )}
          {!isAddView && (
            <>
              <Field label="データセット">
                <Input disabled placeholder="選択中のデータセット名が入る" />
              </Field>
              <Field label="ビューのタイトル">
                <Input placeholder="選択中のビューのタイトルを入力する" />
              </Field>
              <fieldset>
                <legend>パラメーター</legend>
                <Field label="スタイル">
                  <Select>
                    {result_views.style.enumValues.map((item) => (
                      <option key={item} value={item}>
                        {LanguageMap["RESULT_VIEWS_STYLE"][item]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="集計単位">
                  <Select>
                    {result_views.unit.enumValues.map((item) => (
                      <option key={item} value={item}>
                        {LanguageMap["RESULT_VIEWS_UNIT"][item]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </fieldset>
            </>
          )}
        </div>
      </DrawerBody>
    </InlineDrawer>
  );
};
