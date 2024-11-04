import {
  type SelectDataSetDetailArea,
  type SelectDataSetDetailBuilding,
} from "../../schema";

interface Item {
  label: string;
  unit?: string;
}

const buildingMetadata: Record<keyof SelectDataSetDetailBuilding, Item> = {
  id: {
    label: "id",
  },
  data_set_result_id: {
    label: "data_set_result_id",
  },
  household_code: {
    label: "世帯番号",
  },
  normalized_address: {
    label: "正規化住所",
  },
  area_group: {
    label: "建物所属地域区分",
  },
  reference_date: {
    label: "基準日",
  },
  household_size: {
    label: "世帯人数",
    unit: "人",
  },
  members_under_15: {
    label: "15歳未満の世帯人数",
    unit: "人",
  },
  percentage_under_15: {
    label: "15歳未満の世帯に対する人数比",
    unit: "%",
  },
  members_15_to_64: {
    label: "15歳以上64歳以下の世帯人数",
    unit: "人",
  },
  percentage_15_to_64: {
    label: "15歳以上64歳以下の世帯に対する人数比",
    unit: "%",
  },
  members_over_65: {
    label: "65歳以上の世帯人数",
    unit: "人",
  },
  percentage_over_65: {
    label: "65歳以上の世帯に対する人数比",
    unit: "%",
  },
  gender_ratio: {
    label: "男女比",
    unit: "%",
  },
  residence_duration: {
    label: "住定期間",
  },
  water_supply_number: {
    label: "水道番号",
  },
  water_disconnection_flag: {
    label: "閉栓フラグ",
  },
  max_water_usage: {
    label: "最大水道使用量",
    unit: "L",
  },
  avg_water_usage: {
    label: "平均水道使用量",
    unit: "L",
  },
  total_water_usage: {
    label: "合計水道使用量",
    unit: "L",
  },
  min_water_usage: {
    label: "最小水道使用量",
    unit: "L",
  },
  water_supply_source_info: {
    label: "名寄せ元情報_水道",
  },
  structure_name: {
    label: "登記上の構造名称",
  },
  registration_date: {
    label: "登記年月日",
  },
  registration_source_info: {
    label: "名寄せ元情報_住基",
  },
  vacant_house_id: {
    label: "ID_空き家結果_データクレンジング済",
  },
  vacant_house_address: {
    label: "住所_空き家結果_データクレンジング済",
  },
  vacant_house_longitude: {
    label: "vacant_house_longitude",
  },
  vacant_house_latitude: {
    label: "vacant_house_latitude",
  },
  vacant_house_source_info: {
    label: "vacant_house_source_info",
  },
  geocoded_address: {
    label: "geocoded_address",
  },
  geocoded_longitude: {
    label: "geocoded_longitude",
  },
  geocoded_latitude: {
    label: "geocoded_latitude",
  },
  geocoding_source_info: {
    label: "geocoding_source_info",
  },
  has_water_supply: {
    label: "has_water_supply",
  },
  has_juki_registry: {
    label: "has_juki_registry",
  },
  has_touki_registry: {
    label: "has_touki_registry",
  },
  has_juki_and_water: {
    label: "has_juki_and_water",
  },
  has_vacant_result: {
    label: "has_vacant_result",
  },
  has_juki_water_property: {
    label: "has_juki_water_property",
  },
  has_geocoding: {
    label: "has_geocoding",
  },
  has_juki_water_property_vacant: {
    label: "has_juki_water_property_vacant",
  },
  fid: {
    label: "fid",
  },
  gml_id: {
    label: "GML ID",
  },
  class: {
    label: "class",
  },
  geometry: {
    label: "ジオメトリデータ",
  },
  measuredheight: {
    label: "計測高",
    unit: "m",
  },
  measuredheightUom: {
    label: "measuredheight_uom",
  },
  src_scale: {
    label: "src_scale",
  },
  geometry_src_desc: {
    label: "geometry_src_desc",
  },
  thematic_src_desc: {
    label: "thematic_src_desc",
  },
  lod1_height_type: {
    label: "lod1_height_type",
  },
  building_id: {
    label: "building_id",
  },
  prefecture: {
    label: "prefecture",
  },
  city: {
    label: "city",
  },
  description: {
    label: "description",
  },
  rank: {
    label: "洪水浸水ランク",
  },
  depth: {
    label: "洪水浸水深",
    unit: "m",
  },
  depth_uom: {
    label: "depth_uom",
  },
  admin_type: {
    label: "admin_type",
  },
  scale: {
    label: "scale",
  },
  duration: {
    label: "洪水浸水時間",
    unit: "時間",
  },
  duration_uom: {
    label: "duration_uom",
  },
  building_use: {
    label: "building_use",
  },
  floors_above_ground: {
    label: "地上階数",
    unit: "階",
  },
  floors_below_ground: {
    label: "地下階数",
    unit: "階",
  },
  value: {
    label: "value",
  },
  value_uom: {
    label: "value_uom",
  },
  inland_flooding_risk_desc: {
    label: "洪水浸水リスク属性_建物",
  },
  inland_flooding_risk_rank: {
    label: "洪水浸水リスク属性_ランク",
  },
  inland_flooding_risk_depth: {
    label: "洪水浸水リスク属性_浸水深",
    unit: "m",
  },
  inland_flooding_risk_depth_uom: {
    label: "inland_flooding_risk_depth_uom",
  },
  river_flooding_risk_desc: {
    label: "洪水氾濫リスク属性_建物",
  },
  river_flooding_risk_rank: {
    label: "洪水氾濫リスク属性_ランク",
  },
  river_flooding_risk_depth: {
    label: "洪水氾濫リスク属性_氾濫深長",
    unit: "m",
  },
  river_flooding_risk_depth_uom: {
    label: "river_flooding_risk_depth_uom",
  },
  landslide_risk_desc: {
    label: "地滑りリスク属性_建物",
  },
  large_store_name: {
    label: "large_store_name",
  },
  appearance_src_desc: {
    label: "appearance_src_desc",
  },
  branch_id: {
    label: "branch_id",
  },
  residence_id: {
    label: "residence_id",
  },
  is_test: {
    label: "is_test",
  },
  name: {
    label: "建物名",
  },
  area_type: {
    label: "area_type",
  },
  predicted_label: {
    label: "空き家確率",
  },
  predicted_probability: {
    label: "空き家確率",
    unit: "%",
  },
  created_at: {
    label: "created_at",
  },
  updated_at: {
    label: "updated_at",
  },
};

const areaMetadata: Record<keyof SelectDataSetDetailArea, Item> = {
  id: {
    label: "id",
  },
  data_set_result_id: {
    label: "data_set_result_id",
  },
  reference_date: {
    label: "基準日",
    unit: "",
  },
  area_group: {
    label: "地域区分",
    unit: "",
  },
  young_population_ratio: {
    label: "若年層率",
    unit: "%",
  },
  elderly_population_ratio: {
    label: "高齢者率",
    unit: "%",
  },
  total_building_count: {
    label: "建物数",
    unit: "件",
  },
  vacant_house_count: {
    label: "空き家件数",
    unit: "件",
  },
  area: {
    label: "面積",
    unit: "m²",
  },
  geometry: {
    label: "ジオメトリ",
    unit: "",
  },
  key_code: {
    label: "KEYCODE",
    unit: "",
  },
  predicted_probability: {
    label: "空き家確率",
    unit: "%",
  },
  created_at: {
    label: "created_at",
    unit: "",
  },
  updated_at: {
    label: "updated_at",
    unit: "",
  },
};

export const ResultDataSetMetadata = {
  ...buildingMetadata,
  ...areaMetadata,
};
