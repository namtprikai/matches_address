import { makeStyles } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { useFetchResultViews2 } from "../hooks/use-fetch-result-views2";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { TileResultView } from "./tile-result-view";
import { EmptyResultViews } from "./empty-result-views";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: "16px",
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

/**
 * ビューの追加画面で表示されるシートのプレビュー
 */
export const PreviewResultSheet = (): JSX.Element => {
  const styles = useStyles();
  const [selectedResultViewId, setSelectedResultViewId] = useAtom(
    selectedResultViewIdAtom,
  );
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);
  const { data } = useFetchResultViews2({
    sheetId: selectedResultSheetId,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;
    setSelectedResultViewId((prev) => {
      if (!prev) return data[0].id;
      if (!data.find((item) => item.id === prev)) return prev;
      return prev;
    });
  }, [data, setSelectedResultViewId]);

  const resultViewsGridTemplate = (() => {
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
  })();

  if (!data || data.length === 0) return <EmptyResultViews />;

  return (
    <div className={styles.root}>
      <div className={resultViewsGridTemplate}>
        {data.map((item) => (
          <TileResultView
            key={item.id}
            className={styles[`view${item.layoutIndex}` as keyof typeof styles]}
            onClick={() => setSelectedResultViewId(item.id)}
            resultView={item}
            selected={selectedResultViewId === item.id}
          />
        ))}
      </div>
    </div>
  );
};
