import { type IpcMainInvokeEvent } from "electron";
import { fetchAreaBarChartData } from "../bi-modules/api/fetch-area-bar-chart-data";
import { type BarView } from "../bi-modules/interfaces/view";

/** @todo */
type Params = {
  view: BarView;
};
type ReturnType = unknown;

export const _debugFetchChart = async (
  _event: IpcMainInvokeEvent,
  params: Params,
): Promise<ReturnType> => {
  const data = fetchAreaBarChartData(params.view);

  return data;
};
