import useSWR, { type SWRResponse } from "swr";
import { type SelectResultView } from "../schema";

const fetcher = ([sheetId]: [number | undefined | null, string]): Promise<
  SelectResultView[]
> => {
  if (!sheetId) return Promise.resolve([]);
  const result = window.ipcRenderer.invoke("selectResultViews2", {
    sheetId,
  });
  return result;
};

export const useFetchResultViews = ({
  sheetId,
}: {
  sheetId: number | undefined | null;
}): SWRResponse<SelectResultView[]> => {
  const swr = useSWR([sheetId, "useFetchResultViews2"], fetcher);
  return swr;
};
