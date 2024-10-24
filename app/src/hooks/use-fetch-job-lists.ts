import useSWR, { type SWRResponse } from "swr";
import { type SelectJob } from "../schema";

const fetcher = async (): Promise<SelectJob[]> => {
  const result = await window.ipcRenderer.invoke("fetchJobLists");
  return result;
};

export const useFetchJobLists = (): SWRResponse<SelectJob[]> => {
  const swr = useSWR("fetchJobLists", fetcher);
  return swr;
};
