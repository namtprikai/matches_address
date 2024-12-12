import useSWR, { type SWRResponse } from "swr";
import { type SelectNormalizedDataSet } from "../schema";

type Params = {
  filePath: SelectNormalizedDataSet["file_path"] | undefined;
};

type Response = SelectNormalizedDataSet | undefined;

const fetcher = ({ filePath }: Params): Promise<Response> => {
  const result = window.ipcRenderer.invoke(
    "selectNormalizedDatasetWithFilePath",
    {
      filePath,
    },
  );
  return result;
};

export const useFetchNormalizedDatasetWithFilePath = ({
  filePath,
}: Params): SWRResponse<Response> => {
  const swr = useSWR(
    {
      filePath,
      key: useFetchNormalizedDatasetWithFilePath.name,
    },
    fetcher,
  );
  return swr;
};
