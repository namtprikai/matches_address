import useSWR, { type SWRResponse } from "swr";
import { type SelectJob } from "../schema";

const fetcher = async ([jobId]: [number | undefined, string]): Promise<
  SelectJob[]
> => {
  const result = await window.ipcRenderer.invoke("selectJobs", jobId);
  return result;
};

export const useFetchJobs = (jobId?: number): SWRResponse<SelectJob[]> => {
  const swr = useSWR([jobId, useFetchJobs.name], fetcher);
  return swr;
};
