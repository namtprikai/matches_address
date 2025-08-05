// ポップアップのボタンテキスト定数
export const POPUP_BUTTON_TEXT = {
  SHOW_ALL: "すべての項目を表示",
  BACK_TO_SIMPLE: "戻る",
} as const;

// ポップアップのDOM要素ID定数
export const POPUP_ELEMENT_IDS = {
  TOGGLE_BUTTON: "toggle-all-columns-button",
  ALL_COLUMNS_VIEW: "popup-all-columns",
  SIMPLE_VIEW: "popup-simple-view",
} as const;

// ポップアップのTransform値定数
export const POPUP_TRANSFORM_VALUES = {
  SIMPLE_VIEW_VISIBLE: "translateX(0%)",
  SIMPLE_VIEW_HIDDEN: "translateX(-100%)",
  ALL_COLUMNS_VISIBLE: "translateX(0%)",
  ALL_COLUMNS_HIDDEN: "translateX(100%)",
} as const;

// 除外カラムの設定（修正しやすいように設定として外部化）
export const EXCLUDED_COLUMN_PATTERNS = {
  // ID系
  idColumns: [
    "id",
    "uuid",
    "_id",
    "gml_id",
    "building_id",
    "vacant_house_id",
  ] as const,

  // 日時系
  dateTimeColumns: [
    "created_at",
    "updated_at",
    "deleted_at",
    "reference_date",
  ] as const,

  // ジオメトリ系
  geometryColumns: [
    "geometry",
    "geom",
    "coordinates",
    "geocoded_longitude",
    "geocoded_latitude",
    "vacant_house_longitude",
    "vacant_house_latitude",
  ] as const,

  // システム内部フラグ
  systemFlags: ["is_deleted", "version", "data_set_result_id"] as const,
} as const;

// 現在表示中のカラムを取得する関数（各ポップアップで使用されているカラム）
export const CURRENTLY_DISPLAYED_COLUMNS = {
  area: [
    "predicted_probability",
    "area_group",
    "young_population_ratio",
    "elderly_population_ratio",
    "area",
    "vacant_house_count",
    "total_building_count",
  ] as const,

  building: [
    "predicted_probability",
    "normalized_address",
    "household_size",
    "members_under_15",
    "members_15_to_64",
    "members_over_65",
    "total_water_usage",
    "water_disconnection_flag",
    "registration_date",
    "structure_name",
  ] as const,
} as const;
