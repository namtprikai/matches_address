import useSWR, { type SWRResponse } from "swr";

const fetcher = ([{ datasetPath, fileType }]: [
  {
    datasetPath: string;
    fileType: "csv" | "citygml" | "shapefile";
  },
  string,
]): Promise<string[] | undefined> => {
  const result = window.ipcRenderer.invoke("readDatasetColumns", {
    datasetPath,
    fileType,
  });
  return result;
};

export const useFetchDatasetColumns = ({
  datasetPath,
  fileType,
}: {
  datasetPath: string;
  fileType: "csv" | "citygml" | "shapefile";
}): SWRResponse<string[] | undefined> => {
  const swr = useSWR(
    [
      {
        datasetPath,
        fileType,
      },
      "useFetchDatasetColumns",
    ],
    fetcher,
  );
  return swr;
};
