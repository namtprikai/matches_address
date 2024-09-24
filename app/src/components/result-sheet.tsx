import { makeStyles, tokens } from "@fluentui/react-components";
import { useMemo } from "react";
import { useFetchResultViews } from "../hooks/use-fetch-result-views";
import { TileResultView } from "./tile-result-view";
import { EmptyResultViews } from "./empty-result-views";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
  },
  template2th: {
    display: "grid",
    gap: "16px",
    gridTemplateAreas: "'view1' 'view2'",
  },
  template3th: {
    display: "grid",
    gap: "16px",
    gridTemplateRows: "max-content max-content",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateAreas: "'view1 view1' 'view2 view3'",
  },
  template4th: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "min-content min-content",
    gridTemplateAreas: "'view1 view2' 'view3 view4'",
  },
  view1: {
    gridArea: "view1",
  },
  view2: {
    gridArea: "view2",
  },
  view3: {
    gridArea: "view3",
  },
  view4: {
    gridArea: "view4",
  },
});

type Props = {
  sheetId: number;
};

/**
 * 判定結果シートの表示
 */
export const ResultSheet = ({ sheetId }: Props): JSX.Element => {
  const styles = useStyles();

  const { data } = useFetchResultViews({ sheetId });

  const resultViewsGridTemplate = useMemo(() => {
    if (!data) return "";
    switch (data.length) {
      case 2:
        return styles.template2th;
      case 3:
        return styles.template3th;
      case 4:
        return styles.template4th;
      default:
        return "";
    }
  }, [data, styles.template2th, styles.template3th, styles.template4th]);

  if (!data || data.length === 0) return <EmptyResultViews />;

  return (
    <div className={styles.root}>
      <div className={resultViewsGridTemplate}>
        {data.map((item) => (
          <TileResultView
            key={item.result_views?.id}
            {...{
              resultView: item.result_views,
              dataSetResult: item.data_set_results,
            }}
          />
        ))}
      </div>
    </div>
  );
};
