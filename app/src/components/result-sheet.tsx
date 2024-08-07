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
  resultViews: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
});

export const ResultSheet = (): JSX.Element => {
  const styles = useStyles();

  const [data] = useAtom(resultViewsAtom);

  return (
    <div>
      {data.length === 0 && <p>ビューがありません</p>}
      <div className={styles.resultViews}>
        {data.map((resultView) => (
          <Card key={resultView.id} className="">
            <CardHeader
              action={
                <Button appearance="subtle" icon={<ArrowDownloadFilled />} />
              }
              header={
                <Subtitle2>{`ID:${resultView.data_set_result_id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
              }
            />
            <div>
              <img alt="dummy" src="https://placehold.co/1220x760" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
