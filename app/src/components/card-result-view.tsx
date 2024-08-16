import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  type CardProps,
  Subtitle2,
} from "@fluentui/react-components";
import { type data_set_results, type result_views } from "../schema";
import { LanguageMap } from "../lang";
import { type ChartProps } from "../@types/charts";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { PieChart } from "./pie-charts";
type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = CardProps & {
  resultView: ResultViews;
  dataSetResult: DataSetResults;
};

/** 仮の分岐、微妙だったらあとでリファクタしてもいいかも */
const SwithViewStyle = ({
  resultViewStyle,
  chartProps,
}: {
  resultViewStyle: ResultViews["style"];
  chartProps: ChartProps;
}): JSX.Element => {
  switch (resultViewStyle) {
    case "bar":
      return (
        <div>
          <img alt="dummy" src="https://placehold.co/1220x760?text=Bar+Chart" />
        </div>
      );
    case "line":
      return (
        <div>
          <img
            alt="dummy"
            src="https://placehold.co/1220x760?text=Line+Chart"
          />
        </div>
      );
    case "pie":
      return (
        <div>
          <PieChart {...chartProps} />
        </div>
      );
    case "table":
      return (
        <div>
          <img
            alt="dummy"
            src="https://placehold.co/1220x760?text=Table+Chart"
          />
        </div>
      );
    case "map":
      return (
        <div>
          <img alt="dummy" src="https://placehold.co/1220x760?text=Map" />
        </div>
      );
    default:
      return <>未設定</>;
  }
};

export const CardResultView = ({
  resultView,
  dataSetResult,
  ...cardProps
}: Props): JSX.Element => {
  const { chartProps } = useFetchFilterDataSetForChart({
    resultId: resultView.id,
    type: "buildings",
    x: "id",
    y: "rank",
  });

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
      </div>
      <SwithViewStyle
        chartProps={chartProps}
        resultViewStyle={resultView.style}
      />
    </Card>
  );
};
