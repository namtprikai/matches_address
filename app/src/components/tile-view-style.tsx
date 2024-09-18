import { type SelectResultView } from "../schema";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";
import { BarChart } from "./bar-charts";
import { LineChart } from "./line-charts";
import { PieChart } from "./pie-charts";
import { Map } from "./map";
import { TableView } from "./table-view";

type Props = {
  style: SelectResultView["style"];
  parameters: SelectResultView["parameters"];
  resultId: number;
  type: "building" | "area";
};

export const TileViewStyle = ({
  style,
  parameters,
  resultId,
  type,
}: Props): JSX.Element => {
  if (style === "pie") {
    const xAxis = parameters.find((p) => p.key === "label");
    const yAxis = parameters.find((p) => p.key === "value");

    const groupingParameters = parameters.filter((p) => p.type === "group");

    const yearParameter = parameters.find(
      (p) => p.key === "year" && p.type === "filter",
    );

    const groupingCalc = parameters.find(
      (p) => p.key === "group_calc" && p.type === "group_option",
    );

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <PieChart
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            groupingCalc={groupingCalc?.value as "avg" | "sum"}
            groupingConditions={groupingParameters.map((p) => p.value)}
            resultId={resultId}
            type={type}
            x={xAxis.value as BUILDING_DATASET_COLUMN}
            y={yAxis.value as BUILDING_DATASET_COLUMN}
          />
        </div>
      );
    }

    return (
      <div>
        <PieChart
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          groupingCalc={groupingCalc?.value as "avg" | "sum"}
          groupingConditions={groupingParameters.map((p) => p.value)}
          resultId={resultId}
          type={type}
          x={xAxis.value as AREA_DATASET_COLUMN}
          y={yAxis.value as AREA_DATASET_COLUMN}
        />
      </div>
    );
  }

  if (style === "bar") {
    const xAxis = parameters.find((p) => p.key === "xAxis");
    const yAxis = parameters.find((p) => p.key === "yAxis");

    const groupingParameters = parameters.filter((p) => p.type === "group");

    const yearParameter = parameters.find(
      (p) => p.key === "year" && p.type === "filter",
    );

    const groupingCalc = parameters.find(
      (p) => p.key === "group_calc" && p.type === "group_option",
    );

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <BarChart
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            groupingCalc={groupingCalc?.value as "avg" | "sum"}
            groupingConditions={groupingParameters.flatMap((p) => p.value)}
            resultId={resultId}
            type={type}
            x={xAxis.value as BUILDING_DATASET_COLUMN}
            y={yAxis.value as BUILDING_DATASET_COLUMN}
          />
        </div>
      );
    }

    return (
      <div>
        <BarChart
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          groupingCalc={groupingCalc?.value as "avg" | "sum"}
          groupingConditions={groupingParameters.flatMap((p) => p.value)}
          resultId={resultId}
          type={type}
          x={xAxis.value as AREA_DATASET_COLUMN}
          y={yAxis.value as AREA_DATASET_COLUMN}
        />
      </div>
    );
  }

  if (style === "line") {
    const xAxis = parameters.find(
      (p) => p.key === "xAxis" && p.type === "column",
    );
    const yAxis = parameters.find(
      (p) => p.key === "yAxis" && p.type === "column",
    );

    const groupingParameters = parameters.filter((p) => p.type === "group");

    const yearParameter = parameters.find(
      (p) => p.key === "year" && p.type === "filter",
    );

    const groupingCalc = parameters.find(
      (p) => p.key === "group_calc" && p.type === "group_option",
    );

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <LineChart
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            groupingCalc={groupingCalc?.value as "avg" | "sum"}
            groupingConditions={groupingParameters.flatMap((p) => p.value)}
            resultId={resultId}
            type={type}
            x={xAxis.value as BUILDING_DATASET_COLUMN}
            y={yAxis.value as BUILDING_DATASET_COLUMN}
          />
        </div>
      );
    }

    return (
      <div>
        <LineChart
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          groupingCalc={groupingCalc?.value as "avg" | "sum"}
          groupingConditions={groupingParameters.flatMap((p) => p.value)}
          resultId={resultId}
          type={type}
          x={xAxis.value as AREA_DATASET_COLUMN}
          y={yAxis.value as AREA_DATASET_COLUMN}
        />
      </div>
    );
  }

  if (style === "table") {
    const columns = parameters.find((p) => p.type === "column");

    const yearParameter = parameters.find(
      (p) => p.key === "year" && p.type === "filter",
    );

    if (!columns) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <TableView
            columns={columns.value.split(",") as BUILDING_DATASET_COLUMN[]}
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            resultId={resultId}
            type={type}
          />
        </div>
      );
    }

    return (
      <div>
        <TableView
          columns={columns.value.split(",") as AREA_DATASET_COLUMN[]}
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          resultId={resultId}
          type={type}
        />
      </div>
    );
  }

  if (style === "map") {
    return (
      <div>
        <Map dataSetResultId={resultId} type={type} />
      </div>
    );
  }

  return <>未設定</>;
};
