import {
  type data_set_results,
  type data_set_detail_areas,
  type data_set_detail_buildings,
  type result_views,
} from "../schema";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { BarChart } from "./bar-charts";
import { LineChart } from "./line-charts";
import { PieChart } from "./pie-charts";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = {
  style: ResultViews["style"];
  dataSetResults: DataSetResults;
  chartOptions:
    | {
        type: "buildings";
        x: keyof typeof data_set_detail_buildings.$inferSelect;
        y: keyof typeof data_set_detail_buildings.$inferSelect;
      }
    | {
        type: "areas";
        x: keyof typeof data_set_detail_areas.$inferSelect;
        y: keyof typeof data_set_detail_areas.$inferSelect;
      };
};

export const TileViewStyle = ({
  style,
  dataSetResults,
  chartOptions,
}: Props): JSX.Element => {
  //@ts-expect-error unionを正しく辿れないため解釈に失敗している
  const { chartProps } = useFetchFilterDataSetForChart({
    resultId: dataSetResults.id,
    x: chartOptions.x,
    y: chartOptions.y,
    type: chartOptions.type,
  });

  if (chartProps.data.length === 0) {
    return <div>データがありません</div>;
  }

  switch (style) {
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
          <img alt="dummy" src="https://placehold.co/1220x760?text=Map" />
        </div>
      );
    default:
      return <>未設定</>;
  }
};
