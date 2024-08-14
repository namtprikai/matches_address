import { EditFilled } from "@fluentui/react-icons";
import { useEffect } from "react";
import { makeStyles, Tab, TabList, tokens } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/button";
import { useFetchWorkbook } from "../../../../hooks/use-fetch-workbook";
import { useFetchResultSheets } from "../../../../hooks/use-fetch-result-sheets";
import { useTabs } from "../../../../hooks/use-tabs";
import { ResultSheet } from "../../../../components/result-sheet";
import { THEME_COLORS } from "../../../../config/theme-colors";

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
  tabItem: {
    padding: 0,
    paddingBottom: "5px",
    "&::after": {
      width: "100%",
      transform: "translate(0, 100%)",
      left: 0,
      bottom: 0,
      backgroundColor: THEME_COLORS.primary,
    },
    "&::before": {
      width: "100%",
      transform: "translate(0, 100%)",
      left: 0,
      bottom: "3px",
    },
    fontSize: tokens.fontSizeBase300,
    color: THEME_COLORS.primary,
    "& .fui-Tab__content": {
      color: THEME_COLORS.primary,
      padding: `0 ${tokens.spacingHorizontalXXS}`,
    },
    '&[aria-selected="true"] .fui-Tab__content': {
      color: THEME_COLORS.primary,
      fontWeight: tokens.fontWeightRegular,
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
          <Button appearance="subtle" icon={<EditFilled />} shape="square" />
        </a>
      </div>

      {selectedValue ? (
        <TabList
          className={styles.tabList}
          onTabSelect={onTabSelect}
          selectedValue={selectedValue}
        >
          {resultSheets.map((item) => (
            <Tab
              key={item.id}
              className={styles.tabItem}
              id={item.title || ""}
              value={item.id}
            >
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
