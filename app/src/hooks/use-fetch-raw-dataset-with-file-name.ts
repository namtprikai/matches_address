import useSWR, { type SWRResponse } from "swr";
import { type SelectRawDataSet } from "../schema";

type Params = {
  fileName: SelectRawDataSet["file_name"];
};

type Response = SelectRawDataSet | undefined;

const fetcher = ({ fileName }: Params): Promise<Response> => {
  const result = window.ipcRenderer.invoke("selectRawDatasetWithFileName", {
    fileName,
  });
  return result;
};

export const useFetchRawDatasetWithFileName = ({
  fileName,
}: Params): SWRResponse<Response> => {
  const swr = useSWR(
    {
      fileName,
      key: useFetchRawDatasetWithFileName.name,
    },
    fetcher,
  );
  return swr;
};
