import { GeoPackageManager } from "@ngageoint/geopackage";

/**
 * GeoPackageファイルから指定されたカラムのユニークな値を取得する
 * @param filePath ファイルへの絶対パス
 * @param columnName 値を取得するカラム名
 */
export const readGPKGColumnValues = async (
  filePath: string,
  columnName: string,
): Promise<string[]> => {
  const values = new Set<string>();
  const geoPackage = await GeoPackageManager.open(filePath);
  const featureTables = geoPackage.getFeatureTables();

  for (const table of featureTables) {
    const featureDao = geoPackage.getFeatureDao(table);
    const tableInfo = geoPackage.getInfoForTable(featureDao);

    // カラムが存在するか確認
    const hasColumn = tableInfo.columns.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- GeoPackage types are not properly typed for column information
      (column: any) => column.name === columnName,
    );

    if (hasColumn) {
      const featureResultSet = featureDao.queryForAll();

      while (featureResultSet.moveToNext()) {
        const featureRow = featureResultSet.getRow();
        const value = featureRow.getValue(columnName);

        if (value && value !== "") {
          values.add(String(value));
        }
      }

      featureResultSet.close();
    }
  }

  return Array.from(values).sort();
};
