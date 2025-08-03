/**
 * 名寄せ処理のデータセット設定（スキーマベース動的生成）
 * FormNormalizationコンポーネントで使用するデータセットの設定を一元管理
 */

import { type lang } from "../lang";
import { type FormNormalizationType } from "../hooks/use-form-normalization";
import { extractNormalizationDatasetColumns } from "../utils/extract-dataset-columns-from-schema";

// スキーマからデータセットのキーを取得する型
type DataKeys = keyof FormNormalizationType["data"];

// データキーのマッピング（スキーマのスネークケース → UIのキャメルケース）
const dataKeyMapping = {
  resident_registry: "residentRegistry",
  water_status: "waterStatus",
  water_usage: "waterUsage",
  land_registry: "landRegistry",
  vacant_house: "vacantHouse",
  census: "census",
  residential_addresses: "residentialAddresses",
  reverse_geocoded_building_polygon: "reverseGeocodedBuildingPolygon",
  address_of_lot_number: "addressOfLotNumber",
  building_type_determination: "buildingTypeDetermination",
} as const satisfies Record<
  DataKeys,
  keyof typeof lang.components.normalizationData
>;

// 表示スタイルの設定（大きな表示にするデータセット）
const LARGE_APPEARANCE_DATASETS_KEYS: DataKeys[] = [
  "resident_registry",
  "water_status",
];

const CATEGORY_DATASETS_KEYS: DataKeys[] = [
  "reverse_geocoded_building_polygon",
  "residential_addresses",
  "address_of_lot_number",
];

// 特殊フォームを持つデータセット
const DATASETS_WITH_FORM = [
  "address_of_lot_number",
  "building_type_determination",
] as const;

// DATASETS_WITH_FORMの要素の型
type DatasetsWithFormType = (typeof DATASETS_WITH_FORM)[number];

type DatasetConfig = {
  fieldName: `data.${DataKeys}`;
  dataKey: keyof typeof lang.components.normalizationData;
  schemaKey: DataKeys;
  appearance: "large" | "default";
  hasColumns: boolean;
  category: "address" | "default";
  hasForm: boolean;
};

/**
 * スキーマから動的にデータセット設定を生成
 */
function generateDatasetConfigs(): DatasetConfig[] {
  const schemaDatasets = extractNormalizationDatasetColumns();

  return Object.entries(schemaDatasets).map(([schemaKey, datasetInfo]) => {
    const typedSchemaKey = schemaKey as DataKeys;
    const dataKey = dataKeyMapping[typedSchemaKey];

    if (!dataKey) {
      throw new Error(`Unknown dataset key: ${schemaKey}`);
    }

    const appearance = LARGE_APPEARANCE_DATASETS_KEYS.includes(typedSchemaKey)
      ? "large"
      : "default";

    const category = CATEGORY_DATASETS_KEYS.includes(typedSchemaKey)
      ? "address"
      : "default";

    const hasForm = (DATASETS_WITH_FORM as readonly DataKeys[]).includes(
      typedSchemaKey,
    );

    return {
      fieldName: `data.${typedSchemaKey}` as const,
      dataKey,
      schemaKey: typedSchemaKey,
      appearance,
      hasColumns: datasetInfo.hasColumns,
      category,
      hasForm,
    };
  });
}

// スキーマベースで生成される動的設定
const DATASET_CONFIGS: DatasetConfig[] = generateDatasetConfigs();

// レイアウト用の分類
export const CATEGORY_DEFAULT_DATASETS_WITH_LARGE = DATASET_CONFIGS.filter(
  (config) => config.appearance === "large" && config.category === "default",
);

export const CATEGORY_DEFAULT_DATASETS = DATASET_CONFIGS.filter(
  (config) => config.appearance !== "large" && config.category === "default",
);

export const CATEGORY_ADDRESS_DATASETS_WITH_LARGE = DATASET_CONFIGS.filter(
  (config) => config.appearance === "large" && config.category === "address",
);

export const CATEGORY_ADDRESS_DATASETS = DATASET_CONFIGS.filter(
  (config) => config.appearance !== "large" && config.category === "address",
);

/**
 * schemaKeyがbuilding_type_determinationまたはaddress_of_lot_numberであるかを検証する型ガード関数
 * @param schemaKey - 検証対象のスキーマキー
 * @returns schemaKeyがbuilding_type_determinationまたはaddress_of_lot_numberの場合true
 */
export function isSpecialDatasetSchemaKey(
  schemaKey: string,
): schemaKey is DatasetsWithFormType {
  return DATASETS_WITH_FORM.includes(schemaKey as DatasetsWithFormType);
}
