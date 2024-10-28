import useSWR, { type SWRResponse } from "swr";
import { type readDatasetColumnsArgs } from "../ipc-main-listeners/read-dataset-columns";

const fetcher = ([{ dataSet, fileType }]: [
  readDatasetColumnsArgs,
  string,
]): Promise<string[] | undefined> => {
  const result = window.ipcRenderer.invoke("readDatasetColumns", {
    dataSet,
    fileType,
  });
  return result;
};

export const useFetchDatasetColumns = ({
  dataSet,
  fileType,
}: readDatasetColumnsArgs): SWRResponse<string[] | undefined> => {
  const swr = useSWR(
    [
      {
        dataSet,
        fileType,
      },
      "useFetchDatasetColumns",
    ],
    fetcher,
  );
  return swr;
};
