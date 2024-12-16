import useSWR, { type SWRResponse } from "swr";
import { type SelectNormalizedDataSet, type SelectRawDataSet } from "../schema";

type Params<T extends "raw" | "normalized"> = {
  filePath:
    | (T extends "raw"
        ? SelectRawDataSet["file_path"]
        : SelectNormalizedDataSet["file_path"])
    | undefined;
  type: T;
};

type Response<T extends "raw" | "normalized"> =
  | (T extends "raw" ? SelectRawDataSet : SelectNormalizedDataSet)
  | undefined;

const fetcher = <T extends "raw" | "normalized">({
  filePath,
  type,
}: Params<T>): Promise<Response<T>> => {
  switch (type) {
    case "raw": {
      const result = window.ipcRenderer.invoke("selectRawDatasetWithFilePath", {
        filePath,
      });
      return result as Promise<Response<T>>;
    }
    case "normalized": {
      const result = window.ipcRenderer.invoke(
        "selectNormalizedDatasetWithFilePath",
        {
          filePath,
        },
      );
      return result as Promise<Response<T>>;
    }
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unreachable: ${exhaustiveCheck}`);
    }
  }
};

export const useFetchDatasetWithFilePath = <T extends "raw" | "normalized">(
  params: Params<T>,
): SWRResponse<Response<T>> => {
  const swr = useSWR(
    {
      ...params,
      key: useFetchDatasetWithFilePath.name,
    },
    fetcher<T>,
  );
  return swr;
};
