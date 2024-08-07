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
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { LanguageMap } from "../lang";

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
        <Card
          onClick={(): void => setSelectedResultViewId(data[0].id)}
          selected={selectedResultViewId === data[0].id}
        >
          <CardHeader
            action={
              <Button appearance="subtle" icon={<ArrowDownloadFilled />} />
            }
            header={
              <Subtitle2>{`ID:${data[0].id} - ${data[0].title || "タイトル未入力"}`}</Subtitle2>
            }
          />
          <div>
            スタイル:{" "}
            {data[0].style && LanguageMap["RESULT_VIEWS_STYLE"][data[0].style]}
            <br />
            単位:{" "}
            {data[0].unit && LanguageMap["RESULT_VIEWS_UNIT"][data[0].unit]}
          </div>
          <div>
            <img alt="dummy" src="https://placehold.co/1220x760" />
          </div>
        </Card>
      </div>
      <div className={styles.resultViews}>
        {data.map(
          (resultView, index) =>
            index !== 0 && (
              <Card
                key={resultView.id}
                onClick={(): void => setSelectedResultViewId(resultView.id)}
                selected={selectedResultViewId === resultView.id}
              >
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
                  スタイル:{" "}
                  {resultView.style &&
                    LanguageMap["RESULT_VIEWS_STYLE"][resultView.style]}
                  <br />
                  単位:{" "}
                  {resultView.unit &&
                    LanguageMap["RESULT_VIEWS_UNIT"][resultView.unit]}
                </div>
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
