import useSWR, { type SWRResponse } from "swr";
import { type SelectNormalizedDataSet } from "../schema";

type Params = {
  fileName: SelectNormalizedDataSet["file_name"];
};

type Response = SelectNormalizedDataSet | undefined;

const fetcher = ({ fileName }: Params): Promise<Response> => {
  const result = window.ipcRenderer.invoke(
    "selectNormalizedDatasetWithFileName",
    {
      fileName,
    },
  );
  return result;
};

export const useFetchNormalizedDatasetWithFileName = ({
  fileName,
}: Params): SWRResponse<Response> => {
  const swr = useSWR(
    {
      fileName,
      key: useFetchNormalizedDatasetWithFileName.name,
    },
    fetcher,
  );
  return swr;
};
