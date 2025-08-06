import useSWR, { type SWRResponse } from "swr";
import { type readDatasetColumnValuesArgs } from "../ipc-main-listeners/read-dataset-column-values";

const fetcher = ([{ filename, columnName }]: [
  readDatasetColumnValuesArgs,
  string,
]): Promise<string[] | undefined> => {
  const result = window.ipcRenderer.invoke("readDatasetColumnValues", {
    filename,
    columnName,
  });
  return result;
};

export const useFetchDatasetColumnValues = ({
  filename,
  columnName,
}: readDatasetColumnValuesArgs): SWRResponse<string[] | undefined> => {
  const swr = useSWR(
    [
      {
        filename,
        columnName,
      },
      "useFetchDatasetColumnValues",
    ],
    fetcher,
  );
  return swr;
};
