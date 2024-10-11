import useSWR, { type SWRResponse } from "swr";
import { type SelectRawDataSet } from "../schema";

const fetcher = async (): Promise<SelectRawDataSet[]> => {
  const result = await window.ipcRenderer.invoke("fetchRawDatasets");
  return result;
};

export const useFetchRawDatasets = (): SWRResponse<SelectRawDataSet[]> => {
  const swr = useSWR("fetchRawDatasets", fetcher);
  return swr;
};
