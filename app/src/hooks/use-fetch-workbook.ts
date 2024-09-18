import useSWR, { type SWRResponse } from "swr";
import { type SelectWorkbook } from "../schema";

const fetcher = ([workbookId]: [string | undefined, string]): Promise<
  SelectWorkbook | undefined
> => {
  const result = window.ipcRenderer.invoke("selectWorkbook", {
    id: Number(workbookId),
  });
  return result;
};

export const useFetchWorkbook = ({
  id,
}: {
  id: string | undefined;
}): SWRResponse<SelectWorkbook | undefined> => {
  const swr = useSWR([id, "useFetchWorkbook"], fetcher);
  return swr;
};
