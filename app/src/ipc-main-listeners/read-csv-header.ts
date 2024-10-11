import { readCSVHeader as readCSVHeaderUtil } from "../utils/read-csv-header";

export const readCSVHeader = async (
  _: unknown,
  { filePath }: { filePath: string },
): Promise<string[]> => {
  return await readCSVHeaderUtil(filePath);
};
