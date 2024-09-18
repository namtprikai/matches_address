import useSWR, { type SWRResponse } from "swr";
import { type SelectResultSheet } from "../schema";

const fetcher = ([workbookId]: [string | undefined, string]): Promise<
  SelectResultSheet[]
> => {
  const result = window.ipcRenderer.invoke("selectResultSheets", {
    workbookId: Number(workbookId),
  });
  return result;
};

export const useFetchResultSheets = ({
  id,
}: {
  id: string | undefined;
}): SWRResponse<SelectResultSheet[]> => {
  const swr = useSWR([id, "useFetchResultSheets"], fetcher);
  return swr;
};
