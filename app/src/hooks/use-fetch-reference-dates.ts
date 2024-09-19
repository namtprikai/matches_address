import useSWR, { type SWRResponse } from "swr";
import { type ReferenceDate } from "../ipc-main-listeners/fetch-reference-dates";

const fetcher = ([dataSetResultId]: [
  number | undefined | null,
  string,
]): Promise<ReferenceDate[] | undefined> => {
  if (dataSetResultId == null) return Promise.resolve(undefined);

  const result = window.ipcRenderer.invoke("fetchReferenceDates", {
    dataSetResultId,
  });
  return result;
};

export const useFetchReferenceDates = ({
  dataSetResultId,
}: {
  dataSetResultId: number | undefined | null;
}): SWRResponse<ReferenceDate[] | undefined> => {
  const swr = useSWR([dataSetResultId, "useFetchReferenceDates"], fetcher);
  return swr;
};
