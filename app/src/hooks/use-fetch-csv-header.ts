import useSWR, { type SWRResponse } from "swr";

const fetcher = ([props]: [{ filePath: string }]): Promise<
  string[] | undefined
> => {
  if (props == null) return Promise.resolve([]);
  const result = window.ipcRenderer.invoke("readCSVHeader", props);
  return result;
};

export const useFetchCSVHeader = (props: {
  filePath: string;
}): SWRResponse<string[] | undefined> => {
  const swr = useSWR([props, useFetchCSVHeader.name], fetcher, {});
  return swr;
};
