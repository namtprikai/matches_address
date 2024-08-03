import { AddFilled, ArrowDownloadFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  tokens,
  SearchBox,
  Card,
  Field,
  Input,
  CardHeader,
  Subtitle2,
  Select,
} from "@fluentui/react-components";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useTabs } from "../../../../hooks/use-tabs";
import { useFormWorkbookEdit } from "../../../../hooks/use-form-workbook-edit";
import { TabListResultSheet } from "../../../../components/tab-list-result-sheet";
import { useFetchDataSetResults } from "../../../../hooks/use-fetch-data-set-results";
import { type data_set_results, result_views } from "../../../../schema";
import { LanguegeMap } from "../../../../lang";

/** 開発用 */
const addDataSetResult = async (
  dataSetResults: (typeof data_set_results.$inferSelect)[],
): Promise<void> => {
  await window.ipcRenderer.invoke("insertDataSetResults", {
    title: `分析結果${dataSetResults.length + 1}`,
  });
};

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
  headingWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: "1",
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    minHeight: "100vh",
  },
  resultsheets: {
    padding: tokens.spacingVerticalL,
  },
  drawerBody: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
  resultViews: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  },
});

export function EditWorkbook(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });
  const { data: dataSetResults } = useFetchDataSetResults();

  const tabs = useTabs<number>();
  const { selectedValue } = tabs;

  const { formMethods, onSubmit } = useFormWorkbookEdit({
    workbookId: id,
    selectedIndex: selectedValue,
  });

  const { control, setValue, watch } = formMethods;
  const { fields } = useFieldArray({
    control,
    name: "resultsheetsWithViews",
  });

  const resultViewsMethods = useFieldArray({
    control,
    name: `resultsheetsWithViews.${selectedValue}.result_views`,
  });

  const isAddView = watch(`resultsheetsWithViews.${selectedValue}.is_add_view`);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <div className={styles.root}>
          {/** ここをコンポーネント切り出すと、ステートが同期しなくなる。謎 */}
          <InlineDrawer open>
            <DrawerHeader>
              <DrawerHeaderTitle
                action={
                  isAddView ? undefined : (
                    <Button
                      icon={<AddFilled />}
                      onClick={(): void => {
                        setValue(
                          `resultsheetsWithViews.${selectedValue}.is_add_view`,
                          true,
                        );
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
                <div>
                  <SearchBox />
                </div>
                <span className={styles.heading}>データセット一覧</span>
                {isAddView && (
                  <>
                    <div>
                      {dataSetResults.map((item) => (
                        <div key={item.id}>
                          <Button
                            appearance="subtle"
                            onClick={(): void => {
                              resultViewsMethods.append({
                                sheet_id: watch(
                                  `resultsheetsWithViews.${selectedValue}.sheet_id`,
                                ),
                                data_set_result_id: item.id,
                                title: "",
                                unit: "area",
                              });
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
                      <Input
                        disabled
                        placeholder="選択中のデータセット名が入る"
                      />
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
                              {LanguegeMap["RESULT_VIEWS_STYLE"][item]}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="集計単位">
                        <Select>
                          {result_views.unit.enumValues.map((item) => (
                            <option key={item} value={item}>
                              {LanguegeMap["RESULT_VIEWS_UNIT"][item]}
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

          <div className={styles.content}>
            <div className={styles.headingWithAction}>
              <h2 className={styles.heading}>{workbook?.title}</h2>
              <Button appearance="primary" type="submit">
                保存
              </Button>
            </div>

            <TabListResultSheet {...tabs} workbookId={id} />
            <div>
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.resultsheets}
                  hidden={selectedValue !== index}
                >
                  {/** ここをコンポーネント切り出すと、ステートが同期しなくなる。謎 */}
                  <div>
                    <div>
                      {resultViewsMethods.fields.length === 0 && (
                        <p>ビューがありません</p>
                      )}
                      <div className={styles.resultViews}>
                        {resultViewsMethods.fields.map((resultView) => (
                          <Card key={resultView.id} className="">
                            <CardHeader
                              action={
                                <Button
                                  appearance="subtle"
                                  icon={<ArrowDownloadFilled />}
                                />
                              }
                              header={
                                <Subtitle2>{`ID:${resultView.data_set_result_id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
                              }
                            />
                            <div>
                              <img
                                alt="dummy"
                                src="https://placehold.co/1220x760"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a href={`#analysis/workbook/${id}`}>
              <Button>詳細に戻る</Button>
            </a>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
