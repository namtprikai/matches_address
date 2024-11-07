import { type result_views } from "./schema";

type ResultViewsStyle = (typeof result_views.style.enumValues)[number];
const RESULT_VIEWS_STYLE: {
  [key in ResultViewsStyle]: string;
} = {
  map: "地図",
  bar: "棒グラフ",
  line: "折れ線グラフ",
  pie: "円グラフ",
  table: "表",
};

type ResultViewsUnit = (typeof result_views.unit.enumValues)[number];
const RESULT_VIEWS_UNIT: {
  [key in ResultViewsUnit]: string;
} = {
  building: "建物",
  area: "地域",
};

const NORMALIZATION_PARAMETER_LABEL = {
  address: "住所",
  latitude: "緯度",
  longitude: "経度",
  household_code: "世帯番号",
  birthDate: "生年月日",
  gender: "性別",
  resident_date: "住定年月日",
  water_supply_number: "水道番号",
  water_disconnection_date: "水道閉栓日",
  water_connection_date: "水道開栓日",
  water_disconnection_flag: "水道閉栓フラグ",
  water_usage: "水道使用量",
  water_recorded_date: "水道検針年月日",
  structure_name: "建物構造名",
  registration_date: "登録年月日",
  vacant_house_id: "空き家ID",
  building_id: "建物ID",
  reference_date: "基準日",
  reference_data: "基準データ",
};

const NORMALIZATION_DATA_LABEL = {
  residentRegistry: "住民基本台帳データ",
  waterStatus: "水道状況データ",
  waterUsage: "水道使用量データ",
  landRegistry: "土地登記データ",
  vacantHouse: "空き家データ",
  geocoding: "ジオコーディングデータ",
  buildingPolygon: "建物ポリゴンデータ",
  urbanPlanning: "都市計画決定情報データ",
};

export const LanguageMap = {
  RESULT_VIEWS_STYLE,
  RESULT_VIEWS_UNIT,
  NORMALIZATION_PARAMETER_LABEL,
  NORMALIZATION_DATA_LABEL,
};
