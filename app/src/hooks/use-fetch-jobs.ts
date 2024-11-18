import useSWR, { type SWRResponse } from "swr";
import { type SelectJob } from "../schema";

const fetcher = async (): Promise<SelectJob[]> => {
  const result = await window.ipcRenderer.invoke("selectJobs");
  return result;
};

export const useFetchJobs = (): SWRResponse<SelectJob[]> => {
  const swr = useSWR(useFetchJobs.name, fetcher);
  return swr;
};
