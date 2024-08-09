import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  makeStyles,
  Subtitle2,
} from "@fluentui/react-components";
import { useFetchResultViews } from "../hooks/use-fetch-result-views";

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

type Props = {
  sheetId: number;
};

/**
 * 判定結果シートの表示
 */
export const ResultSheet = ({ sheetId }: Props): JSX.Element => {
  const styles = useStyles();

  const { data } = useFetchResultViews({ sheetId });

  if (data.length === 0)
    return (
      <div>
        <p>ビューがありません</p>
      </div>
    );

  return (
    <div className={styles.root}>
      <div>
        <Card>
          <CardHeader
            action={
              <Button appearance="subtle" icon={<ArrowDownloadFilled />} />
            }
            header={
              <Subtitle2>{`ID:${data[0].data_set_result_id} - ${data[0].title || "タイトル未入力"}`}</Subtitle2>
            }
          />
          <div>
            <img alt="dummy" src="https://placehold.co/1220x760" />
          </div>
        </Card>
      </div>
      <div className={styles.resultViews}>
        {data.map(
          (resultView, index) =>
            index !== 0 && (
              <Card key={resultView.id}>
                <CardHeader
                  action={
                    <Button
                      appearance="subtle"
                      icon={<ArrowDownloadFilled />}
                    />
                  }
                  header={
                    <Subtitle2>{`ID:${resultView.data_set_result_id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
                  }
                />
                <div>
                  <img alt="dummy" src="https://placehold.co/1220x760" />
                </div>
              </Card>
            ),
        )}
      </div>
    </div>
  );
};
