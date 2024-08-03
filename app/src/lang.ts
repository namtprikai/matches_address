import { type result_views } from "./schema";

type ResultViewsStyle = (typeof result_views.style.enumValues)[number];
const RESULT_VIEWS_STYLE: {
  [key in ResultViewsStyle]: string;
} = {
  map: "地図",
  bar: "棒グラフ",
  line: "折れ線グラフ",
  pie: "円グラフ",
};

type ResultViewsUnit = (typeof result_views.unit.enumValues)[number];
const RESULT_VIEWS_UNIT: {
    [key in ResultViewsUnit]: string;
  } = {
    building: "建物",
    area: "地域",
  };

export const LanguegeMap = {
  RESULT_VIEWS_STYLE,
  RESULT_VIEWS_UNIT
};
