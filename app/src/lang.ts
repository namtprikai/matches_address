import { type DataSetDetailBuidlings } from "./@types/analysis";
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

const DATA_SET_DETAIL_BUILDINGS: {
  [k in keyof DataSetDetailBuidlings]: string;
} = {
  id: "ID",
  data_set_result_id: "データセット結果ID",
  created_at: "作成日時",
  updated_at: "更新日時",
}

export const LanguageMap = {
  RESULT_VIEWS_STYLE,
  RESULT_VIEWS_UNIT,
  DATA_SET_DETAIL_BUILDINGS,
};
