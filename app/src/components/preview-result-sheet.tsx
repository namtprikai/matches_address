import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  makeStyles,
  Subtitle2,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { resultViewsAtom } from "../state/result-views-atom";

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
        <Card>
          <CardHeader
            action={
              <Button appearance="subtle" icon={<ArrowDownloadFilled />} />
            }
            header={
              <Subtitle2>{`ID:${data[0].id} - ${data[0].title || "タイトル未入力"}`}</Subtitle2>
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
              <Card key={resultView.id} className="">
                <CardHeader
                  action={
                    <Button
                      appearance="subtle"
                      icon={<ArrowDownloadFilled />}
                    />
                  }
                  header={
                    <Subtitle2>{`ID:${resultView.id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
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
