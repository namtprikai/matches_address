import { makeStyles } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { TileResultView } from "./tile-result-view";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: "16px",
  },
  resultViews: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
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

  /** 仮 */
  if (data.length === 0) return <div style={{ height: "60vh" }}></div>;

  if (data.length === 4) {
    return (
      <div className={styles.root}>
        <div className={styles.resultViews}>
          {data.map((item) => (
            <TileResultView
              key={item.result_views.id}
              onClick={(): void =>
                setSelectedResultViewId(item.result_views.id)
              }
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
  }

  return (
    <div className={styles.root}>
      <div>
        <TileResultView
          onClick={(): void => setSelectedResultViewId(data[0].result_views.id)}
          selected={selectedResultViewId === data[0].result_views.id}
          {...{
            dataSetResult: data[0].data_set_results,
            resultView: data[0].result_views,
          }}
        />
      </div>
      <div className={styles.resultViews}>
        {data.map(
          (item, index) =>
            index !== 0 && (
              <TileResultView
                key={item.result_views.id}
                onClick={(): void =>
                  setSelectedResultViewId(item.result_views.id)
                }
                selected={selectedResultViewId === item.result_views.id}
                {...{
                  dataSetResult: item.data_set_results,
                  resultView: item.result_views,
                }}
              />
            ),
        )}
      </div>
    </div>
  );
};
