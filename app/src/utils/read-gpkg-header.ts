import { GeoPackageManager } from "@ngageoint/geopackage";

export const readGPKGHeaders = async (filePath: string): Promise<string[]> => {
  const geoPackage = await GeoPackageManager.open(filePath);
  const featureTables = geoPackage.getFeatureTables();

  const columns = featureTables.flatMap((table) => {
    const featureDao = geoPackage.getFeatureDao(table);
    const tableInfo = geoPackage.getInfoForTable(featureDao);
    return tableInfo.columns.map((column: any) => column.name);
  });

  return columns;
};
