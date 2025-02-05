import { type IpcMainInvokeEvent } from "electron";
import { fetchAreaBarChartData } from "../bi-modules/api/fetch-area-bar-chart-data";
import { type BarView } from "../bi-modules/interfaces/view";

type Params = {
  view: BarView;
};

/** 共通化の余地あり */
type ReturnType = {
  x: string;
  y: number;
  group?: unknown;
}[];

export const _debugFetchChart = async (
  _event: IpcMainInvokeEvent,
  params: Params,
): Promise<ReturnType> => {
  const data = fetchAreaBarChartData(params.view);

  return data;
};
