import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { useTabs } from "../../../../hooks/use-tabs";
import { useFetchDataSetResults } from "../../../../hooks/use-fetch-data-set-results";
import { Resultsheet } from "../../../../components/result-sheet";
import { ButtonEditableSheetTitle } from "../../../../components/button-editable-sheet-title";
import { result_view_schema } from "../../../../zod/result-view";

/** 仮schema・実装しながら考える
 * - シートを配列で持つ
 * - ビューを配列で持つ
 * - シートは常に永続化されている
 */
const form_schema = z.object({
  resultsheetsWithViews: z.array(
    z.object({
      sheet_id: z.number(),
      sheet_title: z.string(),
      result_views: z.array(result_view_schema),
    }),
  ),
});
type FormType = z.infer<typeof form_schema>;

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
  const { data: resultsheets, refetch: fetchResultSheets } =
    useFetchResultSheets({ id });
  const { data: dataSetResults, refetch: fetchDataSetResults } =
    useFetchDataSetResults();
  const { onTabSelect, selectedValue, setSelectedValue } = useTabs();

  const { control, register, setValue } = useForm<FormType>({
    resolver: zodResolver(form_schema),
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "resultsheetsWithViews",
    },
  );

  /** fixme: シート追加したあとも0番目に戻ってしまうの微妙かも */
  useEffect(() => {
    setSelectedValue(resultsheets[0]?.id);
  }, [resultsheets, setSelectedValue]);

  /** fetchしてきたシート情報をformにセット */
  useEffect(() => {
    setValue(
      "resultsheetsWithViews",
      resultsheets.map((sheet) => ({
        sheet_id: sheet.id,
        sheet_title: sheet.title || "",
        result_views: [],
      })),
    );
  }, [resultsheets, setSelectedValue, setValue]);

  const addResultSheet = async (
    workbookId: string | undefined,
  ): Promise<void> => {
    if (!workbookId) return;
    await window.ipcRenderer.invoke("insertResultSheets", {
      title: `シート${resultsheets.length + 1}`,
      workbook_id: Number(workbookId),
    });
    await fetchResultSheets(workbookId).catch(console.error);
  };

  const addDataSetResult = async (): Promise<void> => {
    await window.ipcRenderer.invoke("insertDataSetResults", {
      title: `分析結果${dataSetResults.length + 1}`,
    });
    await fetchDataSetResults().catch(console.error);
  };

  const addResultView = async ({
    sheetId,
    dataSetResultId,
  }: {
    sheetId: number;
    dataSetResultId: number;
  }): Promise<void> => {
    await window.ipcRenderer.invoke("insertResultViews", {
      sheet_id: sheetId,
      data_set_result_id: dataSetResultId,
    });
  };

  return (
    <div className={styles.root}>
      <InlineDrawer open>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={<Button icon={<AddFilled />} shape="square" />}
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
            <div>
              {dataSetResults.map((item) => (
                <div key={item.id}>
                  <Button
                    appearance="subtle"
                    onClick={(): void => {
                      addResultView({
                        sheetId: selectedValue as number,
                        dataSetResultId: item.id,
                      }).catch(console.error);
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
                onClick={addDataSetResult}
                size="small"
              >
                データセットを追加(開発用)
              </Button>
            </div>
          </div>
        </DrawerBody>
      </InlineDrawer>
      <div className={styles.content}>
        <h2 className={styles.heading}>{workbook?.title}</h2>

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
          {resultsheets.map((item) => (
            <div
              key={item.id}
              className={styles.resultsheets}
              hidden={selectedValue !== item.id}
            >
              <Resultsheet resultsheet={item} />
            </div>
          ))}
        </div>
        <a href={`#analysis/workbook/${id}`}>
          <Button>詳細に戻る</Button>
        </a>
      </div>
    </div>
  );
}
