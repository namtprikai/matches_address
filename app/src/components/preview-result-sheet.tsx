import { makeStyles } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { CardResultView } from "./card-result-view";

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

  if (data.length === 0)
    return (
      <div>
        <p>ビューがありません</p>
      </div>
    );

  return (
    <div className={styles.root}>
      <div>
        <CardResultView
          onClick={(): void => setSelectedResultViewId(data[0].result_views.id)}
          selected={selectedResultViewId === data[0].result_views.id}
          {...{
            dataSetResult: data[0].data_set_results,
            resultView: data[0].result_views,
            dataSetDetailAreas: data[0].data_set_detail_areas,
            dataSetDetailBuildings: data[0].data_set_detail_buildings,
          }}
        />
      </div>
      <div className={styles.resultViews}>
        {data.map(
          (item, index) =>
            index !== 0 && (
              <CardResultView
                key={item.result_views.id}
                onClick={(): void =>
                  setSelectedResultViewId(item.result_views.id)
                }
                selected={selectedResultViewId === item.result_views.id}
                {...{
                  dataSetResult: item.data_set_results,
                  resultView: item.result_views,
                  dataSetDetailAreas: item.data_set_detail_areas,
                  dataSetDetailBuildings: item.data_set_detail_buildings,
                }}
              />
            ),
        )}
      </div>
    </div>
  );
};
