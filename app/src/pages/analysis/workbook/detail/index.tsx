import { useEffect } from "react";
import { makeStyles, Tab, TabList, tokens } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { useTabs } from "../../../../hooks/use-tabs";

const useStyles = makeStyles({
  root: {},
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  resultsheets: {
    padding: tokens.spacingVerticalL,
  },
});

export function DetailWorkbook(): JSX.Element {
  const styles = useStyles();

  const { id } = useParams();

  const { data: workbook } = useFetchWorkbook({ id });
  const { data: resultsheets } = useFetchResultSheets({ id });
  const { onTabSelect, selectedValue, setSelectedValue } = useTabs();

  useEffect(() => {
    setSelectedValue(resultsheets[0]?.id);
  }, [resultsheets, setSelectedValue]);

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>{workbook?.title}</h2>

      {selectedValue ? (
        <TabList onTabSelect={onTabSelect} selectedValue={selectedValue}>
          {resultsheets.map((item) => (
            <Tab key={item.id} id={item.title || ""} value={item.id}>
              {item.title}
            </Tab>
          ))}
        </TabList>
      ) : null}
      <div>
        {resultsheets.map((item) => (
          <div
            key={item.id}
            className={styles.resultsheets}
            hidden={selectedValue !== item.id}
          >
            コンテンツ: {item.title}
          </div>
        ))}
      </div>

      <div>
        <a href={`#analysis/workbook/${id}/edit`}>
          <Button>編集</Button>
        </a>
      </div>
    </div>
  );
}
