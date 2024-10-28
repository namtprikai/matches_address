import { readCSVHeaders } from "../utils/read-csv-headers";
import { readShpAttributes } from "../utils/read-shp-attributes";
import { type IpcMainListener } from ".";

/**
 * データセットの絶対パスからカラム名を取得する
 */
export const readDatasetColumns = (async (
  _: unknown,
  {
    datasetPath,
    fileType,
  }: {
    datasetPath: string;
    fileType: "csv" | "citygml" | "shapefile";
  },
): Promise<string[] | undefined> => {
  switch (fileType) {
    case "csv": {
      const result = await readCSVHeaders(datasetPath);
      return result;
    }
    case "citygml":
      return ["citygml"];
    case "shapefile": {
      const result = await readShpAttributes(datasetPath);
      return result;
    }
  }
}) satisfies IpcMainListener;
