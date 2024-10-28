import { readCSVHeaders } from "../utils/read-csv-headers";
import { readShpAttributes } from "../utils/read-shp-attributes";
import { type SelectRawDataSet } from "../schema";
import { type IpcMainListener } from ".";

export type readDatasetColumnsArgs = {
  dataSet: SelectRawDataSet | undefined;
  fileType: "csv" | "citygml" | "shapefile";
};

/**
 * データセットの絶対パスからカラム名を取得する
 */
export const readDatasetColumns = (async (
  _: unknown,
  { dataSet, fileType }: readDatasetColumnsArgs,
): Promise<string[] | undefined> => {
  if (!dataSet) {
    return undefined;
  }

  switch (fileType) {
    case "csv": {
      const result = await readCSVHeaders(dataSet.file_path);
      return result;
    }
    case "citygml":
      return ["citygml"];
    case "shapefile": {
      const result = await readShpAttributes(dataSet.file_path);
      return result;
    }
  }
}) satisfies IpcMainListener;
