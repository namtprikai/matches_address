import { type SelectResultViewResponse } from "../ipc-main-listeners/select-result-view";
import { type data_set_detail_buildings } from "../schema";
import { useFetchFilterDataSetForChart } from "../hooks/use-fetch-filtered-data-set-for-chart";
import { useFetchFilterDataSetForTable } from "../hooks/use-fetch-filtered-data-set-for-table";
import { BarChart } from "./bar-charts";
import { LineChart } from "./line-charts";
import { PieChart } from "./pie-charts";
import { _dummyBuildingData } from "./map/_dummy-data";
import { Map } from "./map";
import { TableView } from "./table-view";

type Props = {
  style: SelectResultViewResponse["style"];
  resultId: number;
} & (
  | {
      type: "building";
      x: keyof typeof data_set_detail_buildings.$inferSelect;
      y: keyof typeof data_set_detail_buildings.$inferSelect;
    }
  | {
      type: "area";
      x: keyof typeof data_set_detail_buildings.$inferSelect;
      y: keyof typeof data_set_detail_buildings.$inferSelect;
    }
);

export const TileViewStyle = ({
  style,
  type,
  resultId,
  x,
  y,
}: Props): JSX.Element => {
  //@ts-expect-error Union型を引数として渡した時に正しく解釈しない
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
