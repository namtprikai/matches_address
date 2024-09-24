import useSWR, { type SWRResponse } from "swr";
import { type FetchAreaGroupsArg } from "../ipc-main-listeners/fetch-area-groups";

const fetcher = async ([props]: [FetchAreaGroupsArg, string]): Promise<
  string[]
> => {
  if (props == null) return Promise.resolve([]);
  const result = await window.ipcRenderer.invoke("fetchAreaGroups", props);
  return result;
};

export const useFetchAreaGroups = (
  props: FetchAreaGroupsArg,
): SWRResponse<string[]> => {
  const swr = useSWR([props, "useFetchAreaGroups"], fetcher);
  return swr;
};
