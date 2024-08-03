import { AddFilled } from "@fluentui/react-icons";
import { useParams } from "react-router-dom";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  SearchBox,
  Tab,
  TabList,
  tokens,
} from "@fluentui/react-components";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useTabs } from "../../../../hooks/use-tabs";
import { useFetchDataSetResults } from "../../../../hooks/use-fetch-data-set-results";
import { Resultsheet } from "../../../../components/result-sheet";
import { ButtonEditableSheetTitle } from "../../../../components/button-editable-sheet-title";
import { DataSetResults } from "../../../../components/data-set-results";
import { useFormWorkbookEdit } from "../../../../hooks/use-form-workbook-edit";

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
  drawerBody: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
  resultsheets: {
    padding: tokens.spacingVerticalL,
  },
});

export function EditWorkbook(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });

  /** @todo formStateにマージしたほうがわかりやすい？ */
  const { data: dataSetResults } = useFetchDataSetResults();

  const { onTabSelect, selectedValue } = useTabs();

  const { formMethods, onSubmit } = useFormWorkbookEdit({
    workbookId: id,
    selectedSheetId: selectedValue as number,
  });

  const { watch, setValue, control } = formMethods;
  const { fields } = useFieldArray({
    control,
    name: "resultsheetsWithViews",
  });

  const isAddView = watch(
    `resultsheetsWithViews.${selectedValue as number}.is_add_view`,
  );

  const addResultSheet = async (
    workbookId: string | undefined,
  ): Promise<void> => {
    if (!workbookId) return;
    await window.ipcRenderer.invoke("insertResultSheets", {
      title: `シート${fields.length + 1}`,
      workbook_id: Number(workbookId),
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <div className={styles.root}>
          <InlineDrawer open>
            <DrawerHeader>
              <DrawerHeaderTitle
                action={
                  isAddView ? undefined : (
                    <Button
                      icon={<AddFilled />}
                      onClick={(): void => {
                        setValue(
                          `resultsheetsWithViews.${selectedValue as number}.is_add_view`,
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
                  <DataSetResults
                    dataSetResults={dataSetResults}
                    selectedValue={selectedValue as number}
                  />
                )}
                {!isAddView && <>入力モード！</>}
              </div>
            </DrawerBody>
          </InlineDrawer>
          <div className={styles.content}>
            <div className={styles.headingWithAction}>
              <h2 className={styles.heading}>{workbook?.title}</h2>
              <div>h: {selectedValue as number}</div>
              <Button appearance="primary" type="submit">
                保存
              </Button>
            </div>

            <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
              <Button
                appearance="subtle"
                icon={<AddFilled />}
                onClick={(): Promise<void> => addResultSheet(id)}
                shape="square"
              >
                シートを追加
              </Button>
              {fields.map((item) => (
                <Tab
                  key={item.id}
                  id={item.sheet_title || ""}
                  value={item.sheet_id}
                >
                  <ButtonEditableSheetTitle
                    resultSheet={{ id: item.sheet_id, title: item.sheet_title }}
                  />
                </Tab>
              ))}
            </TabList>
            <div>
              {fields.map((item) => (
                <div
                  key={item.id}
                  className={styles.resultsheets}
                  hidden={selectedValue !== item.sheet_id}
                >
                  <Resultsheet resultsheetId={item.sheet_id} />
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
