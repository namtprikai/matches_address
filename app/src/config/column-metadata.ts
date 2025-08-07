import { type ChartColumnType } from "../@types/charts";
import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../schema";
import { translateColumnToJapanese } from "../shared/column-translation-utils";

// 選択基準のドキュメントなし。コードが正
export type AREA_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailArea,
  | "area"
  | "area_group"
  | "young_population_ratio"
  | "elderly_population_ratio"
  | "total_building_count"
  | "vacant_house_count"
  | "predicted_probability"
>;

// 選択基準: https://www.notion.so/eukarya/a46c46fe1b9e4261b81c6c0a8df87189
export type BUILDING_DATASET_COLUMN = keyof Pick<
  SelectDataSetDetailBuilding,
  | "area_group"
  | "reference_date"
  | "normalized_address"
  | "household_code"
  | "household_size"
  | "members_under_15"
  | "percentage_under_15"
  | "members_15_to_64"
  | "percentage_15_to_64"
  | "members_over_65"
  | "percentage_over_65"
  | "gender_ratio"
  | "water_supply_number"
  | "water_disconnection_flag"
  | "max_water_usage"
  | "avg_water_usage"
  | "min_water_usage"
  | "total_water_usage"
  | "water_supply_source_info"
  | "structure_name"
  | "registration_date"
  | "registration_source_info"
  | "duration"
  | "measuredheight"
  | "rank"
  | "depth"
  | "floors_above_ground"
  | "floors_below_ground"
  | "inland_flooding_risk_rank"
  | "inland_flooding_risk_depth"
  | "name"
  | "river_flooding_risk_desc"
  | "river_flooding_risk_rank"
  | "river_flooding_risk_depth"
  | "landslide_risk_desc"
  | "vacant_house_id"
  | "vacant_house_address"
  | "predicted_probability"
  | "predicted_label"
  | "outlier_flag"
  | "single_story_row_house_flag"
  | "buildingtype_determination_not_possible_flag"
  | "elapsed_months_since_stop"
  | "inheritance_status"
  | "extension_status"
  | "matched_data_flag"
>;

export type ColumnMetadataValue = {
  label: string;
  type: ChartColumnType;
  unit?: string;
  groupable?: boolean; // グルーピング可能かどうか
  description?: string;
};
export type ColumnMetadata<COLUMN extends string | number | symbol> = {
  [k in COLUMN]: ColumnMetadataValue;
};

/**
 * D903のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 *
 * 日本語名称との対応は以下のスプレッドシートを正とすること
 * https://docs.google.com/spreadsheets/d/1j5gg41D2D82zFKPna7O18lQETGPCLtpp/edit?gid=1663205080#gid=1663205080
 */
export const AREA_DATASET_COLUMN_METADATA: ColumnMetadata<AREA_DATASET_COLUMN> =
  {
    area: {
      label: translateColumnToJapanese("area", "area"),
      type: "float",
      groupable: true,
      unit: "m^2",
      description: "地域集計用データにおける地域ごとの面積",
    },
    area_group: {
      label: translateColumnToJapanese("area_group", "area"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "地域集計用データに入力したデータに基づき、当該建物が属する地域の名称",
    },
    young_population_ratio: {
      label: translateColumnToJapanese("young_population_ratio", "area"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "地域単位における、推定日時点で15歳未満（生年月日から算出）となる人口の割合",
    },
    elderly_population_ratio: {
      label: translateColumnToJapanese("elderly_population_ratio", "area"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "地域単位における、推定日時点で65歳以上（生年月日から算出）となる人口の割合",
    },
    total_building_count: {
      label: translateColumnToJapanese("total_building_count", "area"),
      type: "integer",
      groupable: true,
      unit: "棟",
      description: "地域単位における、住民基本台帳上の戸建て住宅の数",
    },
    predicted_probability: {
      label: translateColumnToJapanese("predicted_probability", "area"),
      type: "float",
      groupable: true,
      unit: "%",
      description: "地域単位において、地域内の住宅数に占める推定空き家数の割合",
    },
    vacant_house_count: {
      label: translateColumnToJapanese("vacant_house_count", "area"),
      type: "integer",
      groupable: true,
      unit: "棟",
      description: `地域単位において、地域内の建物ごとの空き家推定結果を集計した結果
※空き家推定結果：空き家推定の結果、「空き家かどうか」を「モデル構築」の際のしきい値（高度な設定）を基準に判定したフラグ。非空き家は「0」、空き家は「1」で示す。デフォルトの設定では空き家推定確率30%以上（しきい値：0.3）を空き家として判定。`,
    },
  };

/**
 * D902のカラムごとのメタデータをハードコード
 * ここでの設定は、チャートの表示やグルーピングの際に利用される
 *
 * 日本語名称との対応は以下のスプレッドシートを正とすること
 * https://docs.google.com/spreadsheets/d/1j5gg41D2D82zFKPna7O18lQETGPCLtpp/edit?gid=1663205080#gid=1663205080
 */
export const BUILDING_DATASET_COLUMN_METADATA: ColumnMetadata<BUILDING_DATASET_COLUMN> =
  {
    area_group: {
      label: translateColumnToJapanese("area_group", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "地域集計用データに入力したデータに基づき、当該建物が属する地域の名称",
    },
    normalized_address: {
      label: translateColumnToJapanese("normalized_address", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "住民基本台帳の住所を「名寄せ処理」において正規化した住所データ",
    },
    household_code: {
      label: translateColumnToJapanese("household_code", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "住民基本台帳データに記載された世帯を示す番号やID",
    },
    reference_date: {
      label: translateColumnToJapanese("reference_date", "building"),
      type: "date",
      groupable: true,
      unit: "",
      description:
        "モデル構築および空き家推定における基準とする年月日。「名寄せ処理」において設定した推定日（推定したい日付）を示す。",
    },
    household_size: {
      label: translateColumnToJapanese("household_size", "building"),
      type: "integer",
      groupable: true,
      unit: "人",
      description: "住民基本台帳における同一世帯番号の人数",
    },
    members_under_15: {
      label: translateColumnToJapanese("members_under_15", "building"),
      type: "integer",
      groupable: true,
      unit: "人",
      description:
        "推定日時点で15歳未満（生年月日から算出）となる同一世帯番号の人数",
    },
    members_15_to_64: {
      label: translateColumnToJapanese("members_15_to_64", "building"),
      type: "integer",
      groupable: true,
      unit: "人",
      description:
        "推定日時点で15歳以上64歳以下（生年月日から算出）となる同一世帯番号の人数",
    },
    percentage_under_15: {
      label: translateColumnToJapanese("percentage_under_15", "building"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "推定日時点で15歳未満（生年月日から算出）となる同一世帯番号の人数が世帯人数に占める比率",
    },
    percentage_15_to_64: {
      label: translateColumnToJapanese("percentage_15_to_64", "building"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "推定日時点で15歳以上64歳以下（生年月日から算出）となる同一世帯番号の人数が世帯人数に占める比率",
    },
    members_over_65: {
      label: translateColumnToJapanese("members_over_65", "building"),
      type: "integer",
      groupable: true,
      unit: "人",
      description:
        "推定日時点で65歳以上（生年月日から算出）となる同一世帯番号の人数",
    },
    percentage_over_65: {
      label: translateColumnToJapanese("percentage_over_65", "building"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "推定日時点で65歳以上（生年月日から算出）となる同一世帯番号の人数が世帯人数に占める比率",
    },
    predicted_probability: {
      label: translateColumnToJapanese("predicted_probability", "building"),
      type: "float",
      groupable: true,
      unit: "%",
      description:
        "空き家の推定確率を示す。0～1の間で確率が示され、1に近いほど空き家である確率が高い。",
    },
    predicted_label: {
      label: translateColumnToJapanese("predicted_label", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家推定の結果、「空き家かどうか」を「モデル構築」の際のしきい値（高度な設定）を基準に判定したフラグ。非空き家は「0」、空き家は「1」で示す。デフォルトの設定では空き家推定確率30%以上（しきい値：0.3）を空き家として判定。",
    },
    gender_ratio: {
      label: translateColumnToJapanese("gender_ratio", "building"),
      type: "float",
      groupable: true,
      unit: "",
      description: "世帯人数に占める男女の比率（女性の人数／世帯人数で算出）",
    },
    water_disconnection_flag: {
      label: translateColumnToJapanese("water_disconnection_flag", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "水道開閉栓状況データに記載された、閉栓かどうかを示すのフラグ",
    },
    max_water_usage: {
      label: translateColumnToJapanese("max_water_usage", "building"),
      type: "integer",
      groupable: true,
      unit: "立米",
      description:
        "推定日から１年以内において水道使用量が最大の月の水道使用量（検針周期により２か月単位の量）",
    },
    avg_water_usage: {
      label: translateColumnToJapanese("avg_water_usage", "building"),
      type: "integer",
      groupable: true,
      unit: "立米",
      description:
        "推定日から１年以内における月の平均水道使用量（検針周期により２か月単位の量）",
    },
    min_water_usage: {
      label: translateColumnToJapanese("min_water_usage", "building"),
      type: "integer",
      groupable: true,
      unit: "立米",
      description:
        "推定日から１年以内において水道使用量が最小の月の水道使用量（検針周期により２か月単位の量）",
    },
    total_water_usage: {
      label: translateColumnToJapanese("total_water_usage", "building"),
      type: "integer",
      groupable: true,
      unit: "立米",
      description:
        "推定日から１年以内における合計水道使用量（検針周期により２か月単位の量）",
    },
    water_supply_number: {
      label: translateColumnToJapanese("water_supply_number", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "水道開閉栓状況データおよび水道使用量データに記載された、検針対象者を示す番号やID",
    },
    water_supply_source_info: {
      label: translateColumnToJapanese("water_supply_source_info", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "水道開閉栓状況データの住所を「名寄せ処理」において正規化した住所データ",
    },
    structure_name: {
      label: translateColumnToJapanese("structure_name", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "建物情報データに記載された建物構造",
    },
    registration_date: {
      label: translateColumnToJapanese("registration_date", "building"),
      type: "date",
      groupable: true,
      unit: "",
      description: "建物情報データに記載された登記日付",
    },
    registration_source_info: {
      label: translateColumnToJapanese("registration_source_info", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "建物情報データの住所を「名寄せ処理」において正規化した住所データ",
    },
    vacant_house_id: {
      label: translateColumnToJapanese("vacant_house_id", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "空き家調査が行われた対象住所のユニークID",
    },
    vacant_house_address: {
      label: translateColumnToJapanese("vacant_house_address", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "空き家調査結果データに記載された空き家の住所",
    },

    measuredheight: {
      label: translateColumnToJapanese("measuredheight", "building"),
      type: "integer",
      groupable: true,
      unit: "m",
      description: "PLATEAUの建物モデルデータに含まれる、計測高さ",
    },
    rank: {
      label: translateColumnToJapanese("rank", "building"),
      type: "integer",
      groupable: true,
      unit: "",
      description:
        "PLATEAUの建物モデルデータに含まれる、洪水浸水想定区域　浸水ランク",
    },
    depth: {
      label: translateColumnToJapanese("depth", "building"),
      type: "integer",
      groupable: true,
      unit: "m",
      description:
        "PLATEAUの建物モデルデータに含まれる、洪水浸水想定区域　浸水深",
    },
    duration: {
      label: translateColumnToJapanese("duration", "building"),
      type: "integer",
      groupable: true,
      unit: "時間",
      description:
        "PLATEAUの建物モデルデータに含まれる、洪水浸水想定区域　継続時間",
    },
    floors_above_ground: {
      label: translateColumnToJapanese("floors_above_ground", "building"),
      type: "integer",
      groupable: true,
      unit: "階",
      description: "PLATEAUの建物モデルデータに含まれる、地上階数",
    },
    name: {
      label: translateColumnToJapanese("name", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "PLATEAUの建物モデルデータに含まれる、名称",
    },
    floors_below_ground: {
      label: translateColumnToJapanese("floors_below_ground", "building"),
      type: "integer",
      groupable: true,
      unit: "階",
      description: "PLATEAUの建物モデルデータに含まれる、地下階数",
    },
    inland_flooding_risk_rank: {
      label: translateColumnToJapanese("inland_flooding_risk_rank", "building"),
      type: "integer",
      groupable: true,
      unit: "",
    },
    inland_flooding_risk_depth: {
      label: translateColumnToJapanese(
        "inland_flooding_risk_depth",
        "building",
      ),
      type: "integer",
      groupable: true,
      unit: "m",
      description: "PLATEAUの建物モデルデータに含まれる、内水浸水リスクランク",
    },
    landslide_risk_desc: {
      label: translateColumnToJapanese("landslide_risk_desc", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description:
        "PLATEAUの建物モデルデータに含まれる、土砂災害リスク　現象区分",
    },
    river_flooding_risk_desc: {
      label: translateColumnToJapanese("river_flooding_risk_desc", "building"),
      type: "text",
      groupable: true,
      unit: "",
      description: "PLATEAUの建物モデルデータに含まれる、指定河川名称",
    },
    river_flooding_risk_rank: {
      label: translateColumnToJapanese("river_flooding_risk_rank", "building"),
      type: "integer",
      groupable: true,
      unit: "",
      description: "PLATEAUの建物モデルデータに含まれる、浸水ランク",
    },
    river_flooding_risk_depth: {
      label: translateColumnToJapanese("river_flooding_risk_depth", "building"),
      type: "integer",
      groupable: true,
      unit: "m",
      description: "PLATEAUの建物モデルデータに含まれる、浸水深",
    },
    outlier_flag: {
      label: translateColumnToJapanese("outlier_flag", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家推定の結果、外れ値として扱われるかどうかを示すフラグ。外れ値は「1」、外れ値でない場合は「0」で示す。",
    },
    single_story_row_house_flag: {
      label: translateColumnToJapanese(
        "single_story_row_house_flag",
        "building",
      ),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家推定の結果、単身世帯の長屋であるかどうかを示すフラグ。単身世帯の長屋は「1」、それ以外は「0」で示す。",
    },
    buildingtype_determination_not_possible_flag: {
      label: translateColumnToJapanese(
        "buildingtype_determination_not_possible_flag",
        "building",
      ),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家推定の結果、建物種別の判定が不可能であるかどうかを示すフラグ。判定不可能な場合は「1」、それ以外は「0」で示す。",
    },
    elapsed_months_since_stop: {
      label: translateColumnToJapanese("elapsed_months_since_stop", "building"),
      type: "integer",
      groupable: true,
      unit: "ヶ月",
      description:
        "水道開閉栓状況データにおいて、閉栓からの経過月数を示す。閉栓していない場合は「0」、閉栓している場合は閉栓からの経過月数を示す。",
    },
    inheritance_status: {
      label: translateColumnToJapanese("inheritance_status", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家調査結果データに記載された、相続の有無を示す。相続が完了している場合は「1」、相続が未完了の場合は「0」で示す。",
    },
    extension_status: {
      label: translateColumnToJapanese("extension_status", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家調査結果データに記載された、建物の増改築の有無を示す。増改築が行われている場合は「1」、行われていない場合は「0」で示す。",
    },
    matched_data_flag: {
      label: translateColumnToJapanese("matched_data_flag", "building"),
      type: "boolean",
      groupable: true,
      unit: "",
      description:
        "空き家調査結果データにおいて、空き家推定結果と一致するデータが存在するかどうかを示すフラグ。一致する場合は「1」、一致しない場合は「0」で示す。",
    },
  };
