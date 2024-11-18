import useSWR, { type SWRResponse } from "swr";
import { type SelectJobTask } from "../schema";

type Params = {
  jobId: SelectJobTask["job_id"];
};

const fetcher = async ({ jobId }: Params): Promise<SelectJobTask[]> => {
  const result = await window.ipcRenderer.invoke("selectJobTasks", jobId);
  return result;
};

export const useFetchJobTasks = ({
  jobId,
}: Params): SWRResponse<SelectJobTask[]> => {
  const swr = useSWR(
    {
      jobId,
      key: useFetchJobTasks.name,
    },
    fetcher,
  );
  return swr;
};
