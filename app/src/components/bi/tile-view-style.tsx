import { type SelectResultView } from "../../schema";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../../config/column-metadata";
import { Map } from "../map";
import { TableView } from "./table-view";
import { ChartBar } from "./chart-bar";
import { ChartLine } from "./chart-line";
import { ChartPie } from "./chart-pie";

type Props = {
  style: SelectResultView["style"];
  parameters: SelectResultView["parameters"];
  resultId: number;
  type: "building" | "area";
};

/**
 * このコンポーネント内で同様の処理をまとめているだけなため、後で削除することも検討する
 */
const pickArgsFromParameters = (
  parameters: SelectResultView["parameters"],
  style: Exclude<SelectResultView["style"], "table" | "map" | null>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用したいため
) => {
  const xAxis = parameters.find((p) =>
    style === "pie" ? p.key === "label" : p.key === "xAxis",
  );
  const yAxis = parameters.find((p) =>
    style === "pie" ? p.key === "value" : p.key === "yAxis",
  );

  const groupingParameters = parameters.filter((p) => p.type === "group");

  const filterParameters = parameters.filter(
    (p) => p.type === "filter" && p.key !== "year" && p.key !== "area",
  );

  const yearParameter = parameters.find(
    (p) => p.key === "year" && p.type === "filter",
  );

  const groupingCalc = parameters.find(
    (p) => p.key === "group_calc" && p.type === "group_option",
  );

  const areaParameter = parameters.find(
    (p) => p.key === "area" && p.type === "filter",
  );

  return {
    xAxis,
    yAxis,
    groupingParameters,
    filterParameters,
    yearParameter,
    areaParameter,
    groupingCalc,
  };
};

export const TileViewStyle = ({
  style,
  parameters,
  resultId,
  type,
}: Props): JSX.Element => {
  if (style === "pie") {
    const {
      xAxis,
      yAxis,
      groupingParameters,
      filterParameters,
      yearParameter,
      areaParameter: areaParameter,
      groupingCalc,
    } = pickArgsFromParameters(parameters, style);

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <ChartPie
            filterByAreas={areaParameter?.value}
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            filterConditions={filterParameters.flatMap((p) => p.value)}
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
        <ChartPie
          filterByAreas={areaParameter?.value}
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          filterConditions={filterParameters.flatMap((p) => p.value)}
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
    const {
      xAxis,
      yAxis,
      groupingParameters,
      filterParameters,
      yearParameter,
      areaParameter: areaParameter,
      groupingCalc,
    } = pickArgsFromParameters(parameters, style);

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <ChartBar
            filterByAreas={areaParameter?.value}
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            filterConditions={filterParameters.flatMap((p) => p.value)}
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
        <ChartBar
          filterByAreas={areaParameter?.value}
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          filterConditions={filterParameters.flatMap((p) => p.value)}
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
    const {
      xAxis,
      yAxis,
      groupingParameters,
      filterParameters,
      yearParameter,
      areaParameter: areaParameter,
      groupingCalc,
    } = pickArgsFromParameters(parameters, style);

    if (!xAxis || !yAxis) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <ChartLine
            filterByAreas={areaParameter?.value}
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            filterConditions={filterParameters.flatMap((p) => p.value)}
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
        <ChartLine
          filterByAreas={areaParameter?.value}
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          filterConditions={filterParameters.flatMap((p) => p.value)}
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

    const filterParameters = parameters.filter(
      (p) => p.type === "filter" && p.key !== "year" && p.key !== "area",
    );

    const areaParameter = parameters.find(
      (p) => p.key === "area" && p.type === "filter",
    );

    if (!columns) {
      return <div>パラメーターの値を正しく設定してください</div>;
    }

    if (type === "building") {
      return (
        <div>
          <TableView
            columns={columns.value.split(",") as BUILDING_DATASET_COLUMN[]}
            filterByAreas={areaParameter?.value}
            filterByYear={{
              startValue: yearParameter?.value?.start,
              endValue: yearParameter?.value?.end,
            }}
            filterConditions={filterParameters.flatMap((p) => p.value)}
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
          filterByAreas={areaParameter?.value}
          filterByYear={{
            startValue: yearParameter?.value?.start,
            endValue: yearParameter?.value?.end,
          }}
          filterConditions={filterParameters.flatMap((p) => p.value)}
          resultId={resultId}
          type={type}
        />
      </div>
    );
  }

  if (style === "map") {
    const areas = parameters.find(
      (p) => p.key === "area" && p.type === "filter",
    )?.value;

    return (
      <div>
        <Map areas={areas} dataSetResultId={resultId} type={type} />
      </div>
    );
  }

  return <>未設定</>;
};
