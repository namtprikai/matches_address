import useSWR, { type SWRResponse } from "swr";
import { type SelectJobTask } from "../schema";

const fetcher = async (id: number): Promise<SelectJobTask[]> => {
  const result = await window.ipcRenderer.invoke("fetchJobTasks", id);
  return result;
};

export const useFetchJobTasks = (id: number): SWRResponse<SelectJobTask[]> => {
  const swr = useSWR(["fetchJobTasks", id], () => fetcher(id));
  return swr;
};
