import { type IpcMainInvokeEvent } from "electron";
import { fetchAreaBarChartData } from "../bi-modules/api/fetch-area-bar-chart-data";
import { type View } from "../bi-modules/interfaces/view";
import { fetchBuildingLineChartData } from "../bi-modules/api/fetch-building-line-chart-data";
import { type FetchReturnType } from "../bi-modules/interfaces/fetch";
import { type IpcMainListener } from ".";

type Params = {
  view: View;
  pagination: {
    limit: number;
    offset: number;
  };
};

export const fetchChartData = (async (
  _event: IpcMainInvokeEvent,
  { view, pagination }: Params,
): Promise<FetchReturnType> => {
  switch (view.style) {
    case "bar":
      return await fetchAreaBarChartData({ view, pagination });
    case "line":
      return await fetchBuildingLineChartData({ view, pagination });
    default:
      throw new Error(`style: ${view.style} は未対応です`);
  }
}) satisfies IpcMainListener;
