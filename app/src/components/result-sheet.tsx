import { makeStyles, tokens } from "@fluentui/react-components";
import { useFetchResultViews } from "../hooks/use-fetch-result-views";
import { TileResultView } from "./tile-result-view";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
  },
  resultViews: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
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

  if (!data || data.length === 0)
    return (
      <div>
        <p>ビューがありません</p>
      </div>
    );

  if (data.length === 4) {
    return (
      <div className={styles.root}>
        <div className={styles.resultViews}>
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
  }

  return (
    <div className={styles.root}>
      <div>
        <TileResultView
          key={data[0].result_views?.id}
          {...{
            resultView: data[0].result_views,
            dataSetResult: data[0].data_set_results,
          }}
        />
      </div>
      <div className={styles.resultViews}>
        {data.map(
          ({ data_set_results, result_views }, index) =>
            index !== 0 && (
              <TileResultView
                key={result_views?.id}
                {...{
                  resultView: result_views,
                  dataSetResult: data_set_results,
                }}
              />
            ),
        )}
      </div>
    </div>
  );
};
