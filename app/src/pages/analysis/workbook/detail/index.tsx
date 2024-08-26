import { EditFilled } from "@fluentui/react-icons";
import { useEffect } from "react";
import { makeStyles, TabList, tokens } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { useTabs } from "../../../../hooks/use-tabs";
import { ResultSheet } from "../../../../components/result-sheet";
import { Tab } from "../../../../components/ui/tab";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  resultSheets: {
    padding: 0,
  },
  headingWithAction: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabList: {
    gap: tokens.spacingHorizontalM,
  },
  editButton: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    "&:hover, &:active, &:focus, &:focus-within": {
      border: `1px solid ${tokens.colorNeutralStroke1Selected}`,
    },
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
    <div className={styles.root}>
      <div className={styles.headingWithAction}>
        <h2 className={styles.heading}>{workbook?.title}</h2>
        <a href={`#analysis/workbook/${id}/edit`}>
          <Button
            appearance="outline"
            className={styles.editButton}
            icon={<EditFilled />}
            shape="square"
          />
        </a>
      </div>

      {selectedValue ? (
        <TabList
          className={styles.tabList}
          onTabSelect={onTabSelect}
          selectedValue={selectedValue}
        >
          {resultSheets.map((item) => (
            <Tab key={item.id} id={item.title || ""} value={item.id}>
              {item.title}
            </Tab>
          ))}
        </TabList>
      ) : null}
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
