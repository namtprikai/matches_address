import { translateColumnToJapanese } from "../../../../shared/column-translation-utils";
import { formatDate } from "../../../../utils/format-date";
import {
  EXCLUDED_COLUMN_PATTERNS,
  CURRENTLY_DISPLAYED_COLUMNS,
} from "./_const/popup-constants";

// 除外カラムかどうかを判定する関数（修正しやすいように分離）
const isExcludedColumn = (columnName: string): boolean => {
  const allExcludedPatterns = [
    ...EXCLUDED_COLUMN_PATTERNS.idColumns,
    ...EXCLUDED_COLUMN_PATTERNS.dateTimeColumns,
    ...EXCLUDED_COLUMN_PATTERNS.geometryColumns,
    ...EXCLUDED_COLUMN_PATTERNS.systemFlags,
  ];

  return allExcludedPatterns.some(
    (pattern) => columnName.includes(pattern) || columnName.endsWith(pattern),
  );
};

// カラムの並び順を制御する関数（現在表示中を先頭に、未表示を後に）
const orderColumns = <T extends Record<string, unknown>>(
  properties: T,
  currentlyDisplayed: readonly string[],
): string[] => {
  const allColumns = Object.keys(properties);
  const filteredColumns = allColumns.filter((col) => !isExcludedColumn(col));

  // 現在表示中のカラムを先頭に
  const displayedColumns = currentlyDisplayed.filter((col) =>
    filteredColumns.includes(col),
  );

  // 未表示のカラムを後に
  const undisplayedColumns = filteredColumns.filter(
    (col) => !currentlyDisplayed.includes(col),
  );

  return [...displayedColumns, ...undisplayedColumns];
};

// 値のフォーマット関数（修正しやすいように分離）
const formatValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined) {
    return "??";
  }

  // 日付の場合
  if (key.includes("date") && typeof value === "string") {
    return formatDate(value, "YYYY/MM/DD");
  }

  // 確率・比率の場合（パーセント表示）
  if (
    key.includes("ratio") ||
    key.includes("percentage") ||
    key === "predicted_probability"
  ) {
    if (typeof value === "number") {
      return `${Math.floor(value * 1000) / 10}%`;
    }
  }

  // フラグの場合
  if (key === "water_disconnection_flag") {
    return value === 0 ? "開" : "閉";
  }

  // 数値の場合
  if (typeof value === "number") {
    // 小数点がある場合は適切に丸める
    if (value % 1 !== 0) {
      return (Math.floor(value * 1000) / 1000).toString();
    }
    return value.toString();
  }

  return String(value);
};

// 単位を取得する関数
const getUnit = (key: string): string => {
  const unitMap: Record<string, string> = {
    area: "m²",
    total_water_usage: "立米",
    max_water_usage: "立米",
    avg_water_usage: "立米",
    min_water_usage: "立米",
    household_size: "人",
    members_under_15: "人",
    members_15_to_64: "人",
    members_over_65: "人",
    total_building_count: "件",
    vacant_house_count: "件",
    measuredheight: "m",
    depth: "m",
    duration: "時間",
    floors_above_ground: "階",
    floors_below_ground: "階",
  };

  return unitMap[key] || "";
};

// 全カラム表示用のデータを生成する関数
export const generateAllColumnsData = <T extends Record<string, unknown>>(
  properties: T,
  type: "area" | "building",
): Array<{ key: string; label: string; value: string }> => {
  const currentlyDisplayed = CURRENTLY_DISPLAYED_COLUMNS[type];
  const orderedColumns = orderColumns(properties, currentlyDisplayed);

  return orderedColumns.map((key) => {
    const value = properties[key];
    const formattedValue = formatValue(key, value);
    const unit = getUnit(key);
    const displayValue = unit ? `${formattedValue}${unit}` : formattedValue;

    return {
      key,
      label: translateColumnToJapanese(key, type),
      value: displayValue,
    };
  });
};
