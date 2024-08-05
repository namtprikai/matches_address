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
  resultViews: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
});

type Props = { sheetId: number };
export const ResultSheet = ({ sheetId }: Props): JSX.Element => {
  const styles = useStyles();
  const { data } = useFetchResultViews({ sheetId });
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
