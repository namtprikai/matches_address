import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  type CardProps,
  Subtitle2,
} from "@fluentui/react-components";
import { type data_set_results, type result_views } from "../schema";
import { TileViewStyle } from "./tile-view-style";
type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = CardProps & {
  resultView: ResultViews;
  dataSetResult: DataSetResults | null;
};

export const TileResultView = ({
  resultView,
  dataSetResult,
  ...cardProps
}: Props): JSX.Element => {
  return (
    <Card {...cardProps}>
      <CardHeader
        action={<Button appearance="subtle" icon={<ArrowDownloadFilled />} />}
        header={
          <Subtitle2>{`ID:${resultView.id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
        }
      />
      {dataSetResult === null ? (
        <div>データセットが選択されていません</div>
      ) : (
        <TileViewStyle
          // FIXME:  仮の値を入れている。本来であれば動的に変更可能
          chartOptions={{
            type: "buildings",
            x: "id",
            y: "rank",
          }}
          dataSetResults={dataSetResult}
          style={resultView.style}
        />
      )}
    </Card>
  );
};
