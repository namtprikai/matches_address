import {
  Body1,
  Body1Stronger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { TileResultView } from "./tile-result-view";

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
    gridTemplateRows: "repeat(2, 1fr)",
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

  empty: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh", // 仮
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacingVerticalXL,
  },
  emptyImage: {
    width: "150px",
    height: "150px",
  },
  emptyText: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: tokens.spacingVerticalSNudge,
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

  const [data] = useAtom(resultViewsAtom);

  useEffect(() => {
    if (data.length === 0) return;
    setSelectedResultViewId((prev) => {
      if (!prev) return data[0].result_views.id;
      if (!data.find((item) => item.result_views.id === prev)) return prev;
      return prev;
    });
  }, [data, setSelectedResultViewId]);

  const resultViewsGridTemplate = useMemo(() => {
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
  }, [data.length, styles.template2th, styles.template3th, styles.template4th]);

  /** 仮 */
  if (data.length === 0)
    return (
      <div className={styles.empty}>
        <div className={styles.emptyContainer}>
          <img alt="empty" className={styles.emptyImage} src="/Graph.png" />
          <div className={styles.emptyText}>
            <Body1Stronger>表示するビューがありません。</Body1Stronger>
            <Body1>左のメニューからビューを追加しましょう</Body1>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.root}>
      <div className={resultViewsGridTemplate} title="resultViewssss">
        {data.map((item, index) => (
          <TileResultView
            key={item.result_views.id}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- indexは1~4までしか入ってこない前提で期待通りには動作しているので無視。良い書き方があれば修正したい
            // @ts-ignore
            className={styles[`view${index + 1}`]}
            onClick={(): void => setSelectedResultViewId(item.result_views.id)}
            selected={selectedResultViewId === item.result_views.id}
            {...{
              dataSetResult: item.data_set_results,
              resultView: item.result_views,
            }}
          />
        ))}
      </div>
    </div>
  );
};
