import useSWR, { type SWRResponse } from "swr";
import { type SelectDataSetResult } from "../schema";

type Response = SelectDataSetResult[] | undefined;

const fetcher = ([dataSetResultId]: [
  string | undefined,
  string,
]): Promise<Response> => {
  const result = window.ipcRenderer.invoke("selectDataSetResults", {
    dataSetResultId: Number(dataSetResultId),
  });
  return result;
};

export const useFetchDataSetResultItem = ({
  dataSetResultId,
}: {
  dataSetResultId: string | undefined;
}): SWRResponse<Response> => {
  const swr = useSWR([dataSetResultId, "useFetchDataSetResultItem"], fetcher);
  return swr;
};
