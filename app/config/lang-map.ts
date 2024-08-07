import { type data_set_detail_buildings } from "../@types/anlysis";

export const DataSetDetailBuidings: {
    [key in keyof data_set_detail_buildings]: string;
} = {
    household_id: "世帯番号",
    residence_id: "住居ID",
    number_of_people_in_household: "世帯人数",
    number_of_people_under_15_years_old: "15歳未満人数",
    composition_ratio_of_people_under_15_years_old: "15歳未満人口比率",
    number_of_people_aged_15_to_64: "15~64歳人数",
    composition_ratio_of_people_aged_15_to_64: "15~64歳人口比率",
    number_of_people_aged_65_and_over: "65歳以上人数",
    composition_ratio_of_people_aged_65_and_over: "65歳以上",
    gender_ratio: "性別比",
    period_of_residence: "居住期間",
    closing_flag_suido_residence: "水道閉栓",
    maximum_water_usage_suido_residence: "最大水道使用量",
    structure_name_touki_residence: "構造名",
    registration_date_touki_residence: "登録日",
    akiya_result_cleaned_flag: "空き家分析結果クレンジングフラグ",
    geometry: "geometry",
    predicted_label: "予想ラベル",
    predicted_probability: "予想確率",
} as const