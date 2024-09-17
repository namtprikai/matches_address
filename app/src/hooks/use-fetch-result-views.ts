import useSWR, { type SWRResponse } from "swr";
import { type CustomSelectResultViews } from "../ipc-main-listeners/select-result-views";

const fetcher = ([sheetId]: [string, string]): Promise<
  CustomSelectResultViews[]
> => {
  const result = window.ipcRenderer.invoke("selectResultViews", {
    sheetId: Number(sheetId),
  });
  return result;
};

export const useFetchResultViews = ({
  sheetId,
}: {
  sheetId: number | undefined;
}): SWRResponse<CustomSelectResultViews[]> => {
  const swr = useSWR([String(sheetId), "useFetchResultViews"], fetcher);
  return swr;
};
