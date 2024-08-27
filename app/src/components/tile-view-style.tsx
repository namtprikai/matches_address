import {
  type data_set_results,
  type data_set_detail_areas,
  type data_set_detail_buildings,
  type result_views,
} from "../schema";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { useFetchFilterDataSetForTable } from "../hooks/use-fetch-filtered-data-set-for-table";
import { BarChart } from "./bar-charts";
import { LineChart } from "./line-charts";
import { PieChart } from "./pie-charts";
import { _dummyBuildingData } from "./map/_dummy-data";
import { Map } from "./map";
import { TableView } from "./table-view";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = {
  dataSetResults: DataSetResults;
  chartOptions:
    | {
        type: "buildings";
        style: "pie" | "bar" | "line";
        x: keyof typeof data_set_detail_buildings.$inferSelect;
        y: keyof typeof data_set_detail_buildings.$inferSelect;
      }
    | {
        type: "areas";
        style: "pie" | "bar" | "line";
        x: keyof typeof data_set_detail_areas.$inferSelect;
        y: keyof typeof data_set_detail_areas.$inferSelect;
      }
    | {
        type: "buildings";
        style: "table";
        columns: keyof typeof data_set_detail_buildings.$inferSelect;
      }
    | {
        type: "areas";
        style: "table";
        columns: keyof typeof data_set_detail_areas.$inferSelect;
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

  const { tableProps } = useFetchFilterDataSetForTable({
    resultId: dataSetResults.id,
    type: chartOptions.type,
    columns: chartOptions.columns,
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
          <TableView data={chartProps.data} />
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
