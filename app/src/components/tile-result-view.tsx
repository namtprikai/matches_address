import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  type CardProps,
  Subtitle2,
} from "@fluentui/react-components";
import { type data_set_results, type result_views } from "../schema";
import { type ChartProps } from "../@types/charts";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { PieChart } from "./pie-charts";
import { LineChart } from "./line-charts";
import { BarChart } from "./bar-charts";
import { Map } from "./map";
import { _dummyBuildingData } from "./map/_dummy-data";
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
          <BarChart {...chartProps} />
        </div>
      );
    case "line":
      return (
        <div>
          <LineChart {...chartProps} />
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
          <Map data={_dummyBuildingData} />
        </div>
      );
    default:
      return <>未設定</>;
  }
};

export const TileResultView = ({
  resultView,
  dataSetResult,
  ...cardProps
}: Props): JSX.Element => {
  const { chartProps } = useFetchFilterDataSetForChart({
    resultId: dataSetResult.id,
    type: "buildings",
    x: "id", // FIXME: 仮の値, ここを変えるとチャートの表示が変わる
    y: "rank", // FIXME: 仮の値, ここを変えるとチャートの表示が変わる
  });

  return (
    <Card {...cardProps}>
      <CardHeader
        action={<Button appearance="subtle" icon={<ArrowDownloadFilled />} />}
        header={
          <Subtitle2>{`ID:${resultView.id} - ${resultView.title || "タイトル未入力"}`}</Subtitle2>
        }
      />
      {chartProps.data.length === 0 ? (
        <div>データがありません</div>
      ) : (
        <SwithViewStyle
          chartProps={chartProps}
          resultViewStyle={resultView.style}
        />
      )}
    </Card>
  );
};
