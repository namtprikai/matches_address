import { type PreprocessParameters } from "./@types/job-parameters";
import { type result_views } from "./schema";
import { type FormNormalizationType } from "./hooks/use-form-normalization";

type ResultViewsStyle = (typeof result_views.style.enumValues)[number];
const RESULT_VIEWS_STYLE: {
  [key in ResultViewsStyle]: string;
} = {
  bar: "棒グラフ",
  line: "折れ線グラフ",
  pie: "円グラフ",
  table: "表",
  "map-with-table": "地図",
};

type ResultViewsUnit = (typeof result_views.unit.enumValues)[number];
const RESULT_VIEWS_UNIT: {
  [key in ResultViewsUnit]: string;
} = {
  building: "建物",
  area: "地域",
};

type NormalizationParameterLabelKey =
  | keyof (PreprocessParameters["data"]["resident_registry"]["columns"] &
      PreprocessParameters["data"]["water_status"]["columns"] &
      PreprocessParameters["data"]["water_usage"]["columns"] &
      PreprocessParameters["data"]["land_registry"]["columns"] &
      PreprocessParameters["data"]["vacant_house"]["columns"] &
      Omit<PreprocessParameters["settings"], "advanced">)
  | keyof FormNormalizationType["data"]["reverse_geocoded_building_polygon"]["columns"]
  | keyof FormNormalizationType["data"]["residential_addresses"]["columns"]
  | keyof FormNormalizationType["data"]["address_of_lot_number"]["columns"]
  | keyof FormNormalizationType["data"]["building_type_determination"]["columns"];

type NormalizationParameterLabel = Record<
  NormalizationParameterLabelKey,
  string
>;

const NORMALIZATION_PARAMETER_LABEL: NormalizationParameterLabel = {
  address: "住所",
  household_code: "世帯番号",
  birth_date: "生年月日",
  gender: "性別",
  resident_date: "住定年月日",
  water_supply_number: "水道番号",
  water_disconnection_date: "水道閉栓年月",
  water_connection_date: "水道開栓年月",
  water_disconnection_flag: "水道開閉栓フラグ",
  water_usage: "水道使用量",
  water_recorded_date: "水道検針年月日",
  structure_name: "建物構造名",
  registration_date: "登録年月日",
  reference_date: "推定したい日付",
  building_detail: "建物情報登記内容",
  geometry: "ジオメトリ",
  land_number_address: "地番住所",
  residential_address: "住居表示住所",
  lat: "緯度",
  lon: "経度",
  building_type: "建物種別",
};

export const LanguageMap = {
  RESULT_VIEWS_STYLE,
  RESULT_VIEWS_UNIT,
  NORMALIZATION_PARAMETER_LABEL,
};
