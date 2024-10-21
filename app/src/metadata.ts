import { type result_views } from "./schema";

type ResultViewsStyle = (typeof result_views.style.enumValues)[number];
const RESULT_VIEWS_STYLE: {
  [key in ResultViewsStyle]: string;
} = {
  map: "地図",ß
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
  householdCode: "世帯番号",
  birthDate: "生年月日",
  gender: "性別",
  residentDate: "住定年月日",
  waterSupplyNumber: "水道番号",
  waterDisconnectionDate: "水道閉栓日",
  waterConnectionDate: "水道開栓日",
  waterDisconnectionFlag: "水道閉栓フラグ",
  waterUsage: "水道使用量",
  waterRecordedDate: "水道検針年月日",
  structureName: "建物構造名",
  registrationDate: "登録年月日",
  vacantHouseId: "空き家ID",
  buildingId: "建物ID",
  referenceDate: "基準日",
  referenceData: "基準データ",
};

const NORMALIZATION_DATA = {
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
};
