import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  type CardProps,
  Subtitle2,
} from "@fluentui/react-components";
import {
  type data_set_detail_areas,
  type data_set_detail_buildings,
  type data_set_results,
  type result_views,
} from "../schema";
import { LanguageMap } from "../lang";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;
type DataSetsDetailBuildings = typeof data_set_detail_buildings.$inferSelect;
type DataSetsDetailAreas = typeof data_set_detail_areas.$inferSelect;

type Props = CardProps & {
  resultView: ResultViews;
  dataSetResult: DataSetResults;
  dataSetDetailBuildings: DataSetsDetailBuildings | null;
  dataSetDetailAreas: DataSetsDetailAreas | null;
};

export const CardResultView = ({
  resultView,
  dataSetResult,
  dataSetDetailAreas,
  dataSetDetailBuildings,
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
      <div>
        スタイル:{" "}
        {resultView.style &&
          LanguageMap["RESULT_VIEWS_STYLE"][resultView.style]}
        <br />
        単位:{" "}
        {resultView.unit && LanguageMap["RESULT_VIEWS_UNIT"][resultView.unit]}
        <br />
        データセット: {dataSetResult.title}
        <br />
        建物データID: {dataSetDetailBuildings?.id || "未設定"}
        <br />
        地域データID: {dataSetDetailAreas?.id || "未設定"}
      </div>
      <div>
        <img alt="dummy" src="https://placehold.co/1220x760" />
      </div>
    </Card>
  );
};
