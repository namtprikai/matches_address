import { EditFilled } from "@fluentui/react-icons";
import { useEffect } from "react";
import { makeStyles, Tab, TabList, tokens } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { useTabs } from "../../../../hooks/use-tabs";
import { ResultSheet } from "../../../../components/result-sheet";

const useStyles = makeStyles({
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  resultSheets: {
    padding: tokens.spacingVerticalL,
  },
  headingWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export function DetailWorkbook(): JSX.Element {
  const styles = useStyles();

  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });
  const { data: resultSheets } = useFetchResultSheets({ id });
  const { onTabSelect, selectedValue, setSelectedValue } = useTabs();

  useEffect(() => {
    setSelectedValue(resultSheets[0]?.id);
  }, [resultSheets, setSelectedValue]);

  return (
    <div>
      <div className={styles.headingWithAction}>
        <h2 className={styles.heading}>{workbook?.title}</h2>
        <a href={`#analysis/workbook/${id}/edit`}>
          <Button appearance="subtle" icon={<EditFilled />} shape="square" />
        </a>
      </div>

      <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
        {resultSheets.map((item) => (
          <Tab key={item.id} id={item.title || ""} value={item.id}>
            {item.title}
          </Tab>
        ))}
      </TabList>
      <div>
        {resultSheets.map((item) => (
          <div
            key={item.id}
            className={styles.resultSheets}
            hidden={selectedValue !== item.id}
          >
            <ResultSheet sheetId={item.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
