import useSWR, { type SWRResponse } from "swr";
import { type SelectJob } from "../schema";

interface Params {
  id: SelectJob["id"];
}

type Result = SelectJob | undefined;

const fetcher = async ({ id }: Params): Promise<Result> => {
  const result = await window.ipcRenderer.invoke("selectJob", {
    id,
  });

  return result;
};

export const useFetchJob = ({ id }: Params): SWRResponse<Result> => {
  const swr = useSWR(
    {
      id,
      key: useFetchJob.name,
    },
    fetcher,
  );
  return swr;
};
