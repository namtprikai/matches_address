import { basename } from "path";
import { Open } from "unzipper";
import { readCSVHeaders } from "../utils/read-csv-headers";
import { readShpAttributes } from "../utils/read-shp-attributes";
import { getFilePathInPublic } from "../utils/get-file-path-in-public";
import { type IpcMainListener } from ".";

export type readDatasetColumnsArgs = {
  filename: string | undefined;
};

const classifyFileType = async (
  filePath: string,
): Promise<"csv" | "shapefile" | "citygml"> => {
  const filename = basename(filePath);
  const ext = filename.split(".")?.pop();

  if (ext === "csv") {
    return "csv" as const;
  }

  if (ext === "zip") {
    const directory = await Open.file(filePath);
    // 同一のZip内にShapefileとCityGMLが混在している場合はShapefileを優先
    const isShapefile = directory.files
      .map((file) => file.path)
      .some((path) => path.endsWith(".shp"));

    if (isShapefile) {
      return "shapefile" as const;
    }

    return "citygml" as const;
  }

  return "csv";
};

/**
 * データセットの絶対パスからカラム名を取得する
 */
export const readDatasetColumns = (async (
  _: unknown,
  { filename }: readDatasetColumnsArgs,
): Promise<string[] | undefined> => {
  if (!filename) {
    return undefined;
  }

  const filePath = getFilePathInPublic(filename);
  const fileType = await classifyFileType(filePath);

  switch (fileType) {
    case "csv": {
      const result = await readCSVHeaders(filePath);
      return result;
    }
    case "citygml":
      return ["citygml"];
    case "shapefile": {
      const result = await readShpAttributes(filePath);
      return result;
    }
  }
}) satisfies IpcMainListener;
