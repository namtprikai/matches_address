import { type SelectResultViewResponse } from "../ipc-main-listeners/select-result-view";
import { type Parameter } from "../@types/charts";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { type GroupingCondition } from "../utils/subquery-grouping";
import { BarChart } from "./bar-charts";
import { LineChart } from "./line-charts";
import { PieChart } from "./pie-charts";
import { Map } from "./map";
import { TableView } from "./table-view";

type Props = {
  style: SelectResultViewResponse["style"];
  resultId: number;
} & (
  | {
      type: "building";
      parameters: {
        key: string;
        value: keyof SelectDataSetDetailBuilding;
      } & Parameter[];
      dataSetResults: SelectDataSetDetailBuilding;
    }
  | {
      type: "area";
      parameters: {
        key: string;
        value: keyof SelectDataSetDetailArea;
      } & Parameter[];
      dataSetResults: SelectDataSetDetailArea;
    }
);

export const TileViewStyle = ({
  style,
  dataSetResults,
  parameters,
  type,
}: Props): JSX.Element => {
  if (style === "pie") {
    const xAxis = parameters.find((p) => p.key === "label");
    const yAxis = parameters.find((p) => p.key === "value");

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    return (
      <div>
        <PieChart
          resultId={dataSetResults.id}
          type={type}
          x={xAxis.value}
          y={yAxis.value}
        />
      </div>
    );
  }

  if (style === "bar") {
    const xAxis = parameters.find((p) => p.key === "xAxis");
    const yAxis = parameters.find((p) => p.key === "yAxis");

    const groupingParameters = parameters.filter((p) =>
      p.key.startsWith("group_"),
    );

    const startYearParameter = parameters.find((p) => p.key === "year.start");
    const endYearParameter = parameters.find((p) => p.key === "year.end");

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    return (
      <div>
        <BarChart
          filterByYear={{
            startValue: Number(startYearParameter?.value),
            endValue: Number(endYearParameter?.value),
          }}
          groupingConditions={
            groupingParameters.map((p) => p.value) as GroupingCondition[]
          }
          resultId={dataSetResults.id}
          type={type}
          x={xAxis.value}
          y={yAxis.value}
        />
      </div>
    );
  }

  if (style === "line") {
    const xAxis = parameters.find((p) => p.key === "xAxis");
    const yAxis = parameters.find((p) => p.key === "yAxis");

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    return (
      <div>
        <LineChart
          resultId={dataSetResults.id}
          type={type}
          x={xAxis.value}
          y={yAxis.value}
        />
      </div>
    );
  }

  if (style === "table") {
    const columns = parameters.find((p) => p.key === "columns");

    if (!columns) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    return (
      <div>
        <TableView
          columns={columns.value.split(",")}
          resultId={dataSetResults.id}
          type={type}
        />
      </div>
    );
  }

  if (style === "map") {
    return (
      <div>
        <Map dataSetResultsId={dataSetResults.id} type="building" />
      </div>
    );
  }

  return <>未設定</>;
};
