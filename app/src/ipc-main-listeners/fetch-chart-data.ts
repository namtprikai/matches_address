import { type IpcMainInvokeEvent } from "electron";
import { fetchAreaBarChartData } from "../bi-modules/api/fetch-area-bar-chart-data";
import { type View } from "../bi-modules/interfaces/view";
import { fetchBuildingLineChartData } from "../bi-modules/api/fetch-building-line-chart-data";
import { fetchBuildingPieChartData } from "../bi-modules/api/fetch-building-pie-chart-data";
import { type ChartProps } from "../@types/charts";
import { type IpcMainListener } from ".";

type Params = {
  view: View;
};

export const fetchChartData = (async (
  _event: IpcMainInvokeEvent,
  { view }: Params,
): Promise<ChartProps> => {
  switch (true) {
    case view.style === "bar" && view.unit === "area":
      return await fetchAreaBarChartData({ view, pagination: view.pagination });
    case view.style === "line" && view.unit === "building":
      return await fetchBuildingLineChartData({ view });
    case view.style === "pie" && view.unit === "building":
      return await fetchBuildingPieChartData({ view });
    default:
      throw new Error(`style: ${view.style} は未対応です`);
  }
}) satisfies IpcMainListener;
