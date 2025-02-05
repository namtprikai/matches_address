import { type SelectResultView } from "../../schema";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../../config/column-metadata";
import { type View } from "../../bi-modules/interfaces/view";
import { TableView } from "./table-view";
import { ChartBar } from "./chart-bar";
import { ChartLine } from "./chart-line";
import { ChartPie } from "./chart-pie";
import { Map } from "./map";

type Props = {
  view: View;
};

export const TileViewStyle = ({ view }: Props): JSX.Element => {
  const { style, unit, parameters, dataSetResultId } = view;

  switch (true) {
    case style === "pie" && unit === "building":
      return (
        <div>
          <ChartPie view={view} />
        </div>
      );
    case style === "bar" && unit === "area":
      return (
        <div>
          <ChartBar view={view} />
        </div>
      );
    case style === "line" && unit === "building":
      return (
        <div>
          <ChartLine view={view} />
        </div>
      );
    case style === "table" && unit === "building": {
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

      if (unit === "building") {
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
              resultId={dataSetResultId}
              type={unit}
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
            resultId={dataSetResultId}
            type={unit}
          />
        </div>
      );
    }
    case style === "map": {
      const areas = parameters.find(
        (p) => p.key === "area" && p.type === "filter",
      )?.value;

      return (
        <div>
          <Map areas={areas} dataSetResultId={dataSetResultId} type={unit} />
        </div>
      );
    }
  }

  return <>未設定</>;
};
