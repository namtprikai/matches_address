import useSWR, { type SWRResponse } from "swr";
import { type SelectResultSheet } from "../schema";

const fetcher = ([workbookId]: [number | undefined, string]): Promise<
  SelectResultSheet[]
> => {
  if (!workbookId) return Promise.resolve([]);
  const result = window.ipcRenderer.invoke("selectResultSheets", {
    workbookId,
  });
  return result;
};

export const useFetchResultSheets = ({
  id,
}: {
  id: number | undefined;
}): SWRResponse<SelectResultSheet[]> => {
  const swr = useSWR([id, "useFetchResultSheets"], fetcher);
  return swr;
};
