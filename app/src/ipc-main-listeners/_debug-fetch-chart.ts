import { type IpcMainInvokeEvent } from "electron";
import { fetchAreaBarChartData } from "../bi-modules/api/fetch-area-bar-chart-data";
import { type BarView } from "../bi-modules/interfaces/view";
import { type IpcMainListener } from ".";

type Params = {
  view: BarView;
  pagination: {
    limit: number;
    offset: number;
  };
};

/** 共通化の余地あり */
type ReturnType = {
  x: string;
  y: number;
  group?: unknown;
}[];

export const _debugFetchChart = (async (
  _event: IpcMainInvokeEvent,
  { view, pagination }: Params,
): Promise<ReturnType> => {
  const data = fetchAreaBarChartData({
    view,
    pagination,
  });

  return data;
}) satisfies IpcMainListener;
