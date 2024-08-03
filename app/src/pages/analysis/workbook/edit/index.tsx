import { useParams } from "react-router-dom";
import { makeStyles, tokens } from "@fluentui/react-components";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useTabs } from "../../../../hooks/use-tabs";
import { Resultsheet } from "../../../../components/result-sheet";
import { useFormWorkbookEdit } from "../../../../hooks/use-form-workbook-edit";
import { DrawerDataSet } from "../../../../components/drawer-data-set";
import { TabListResultSheet } from "../../../../components/tab-list-result-sheet";

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
});

export function EditWorkbook(): JSX.Element {
  const styles = useStyles();
  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });

  const tabs = useTabs<number>();
  const { selectedValue } = tabs;

  const { formMethods, onSubmit } = useFormWorkbookEdit({
    workbookId: id,
    selectedIndex: selectedValue,
  });

  const { control } = formMethods;
  const { fields } = useFieldArray({
    control,
    name: "resultsheetsWithViews",
  });

  console.log("selectedValue",selectedValue)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit}>
        <div className={styles.root}>
          <DrawerDataSet selectedValue={selectedValue} />
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
                  <Resultsheet fieldIndex={index} />
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
