import useSWR, { type SWRResponse } from "swr";

export type DataSetType = "raw" | "normalized" | "result";

type Params = {
  type: DataSetType;
  id: number;
};

type Response = Record<string, string | number | null>[] | undefined;

const fetcher = async ([type, id]: [
  Params["type"],
  Params["id"],
  string,
]): Promise<Response> => {
  switch (type) {
    case "raw": {
      const dataSet = await window.ipcRenderer.invoke("selectRawDataset", {
        id,
      });
      if (!dataSet) return undefined;
      const file = await window.ipcRenderer.invoke("readDatasetFile", {
        fileName: dataSet.file_path,
      });
      const records = getCsvRecords(file);
      return records;
    }
    case "normalized": {
      const result = await window.ipcRenderer.invoke(
        "selectNormalizedDataSet",
        {
          id,
        },
      );
      if (!result) return undefined;
      const file = await window.ipcRenderer.invoke("readDatasetFile", {
        fileName: result.file_path,
      });
      const records = getCsvRecords(file);
      return records;
    }
    case "result": {
      const result = await window.ipcRenderer.invoke(
        "selectDataSetResults",
        id,
      );
      return result;
    }
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
    }
  }
};

export const useFetchDataSetFile = ({
  type,
  id,
}: Params): SWRResponse<Response> => {
  const swr = useSWR([type, id, useFetchDataSetFile.name], fetcher);
  return swr;
};

function getCsvRecords(file: Buffer): Record<string, string>[] {
  const uint8Array = new Uint8Array(file);
  const csvString = uint8ArrayToString(uint8Array);
  const rows = csvString.trim().split("\n");
  const headers = rows[0].split(",").map((header) => header.trim());
  const records: Record<string, string>[] = rows.slice(1).map((row) => {
    const values = row.split(",").map((value) => value.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || ""; // 値が無い場合は空文字を設定
    });

    return record;
  });

  return records;
}

function uint8ArrayToString(uint8Array: Uint8Array): string {
  return new TextDecoder("utf-8").decode(uint8Array);
}
