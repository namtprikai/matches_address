import { useMemo } from "react";
import { type data_set_detail_buildings } from "../../@types/anlysis";
import { PieChart } from "../../components/pie-charts";

export function About(): JSX.Element {
  const demo: data_set_detail_buildings[] = useMemo(
    () => [
      {
        household_id: "1",
        residence_id: "1",
        address: "札幌市中央区南３条東２丁目",
        number_of_people_in_household: 1,
        number_of_people_under_15_years_old: 1,
        composition_ratio_of_people_under_15_years_old: 1,
        number_of_people_aged_15_to_64: 1,
        composition_ratio_of_people_aged_15_to_64: 1,
        number_of_people_aged_65_and_over: 1,
        composition_ratio_of_people_aged_65_and_over: 1,
        akiya_result_cleaned_flag: true,
        closing_flag_suido_residence: true,
        gender_ratio: 1,
        maximum_water_usage_suido_residence: 1,
        period_of_residence: 1,
        predicted_label: "1",
        predicted_probability: 1,
        registration_date_touki_residence: new Date(),
        structure_name_touki_residence: "1",
        geometry: {},
      },
      {
        household_id: "2",
        residence_id: "2",
        address: "札幌市中央区南４条東３丁目",
        number_of_people_in_household: 2,
        number_of_people_under_15_years_old: 10,
        composition_ratio_of_people_under_15_years_old: 2,
        number_of_people_aged_15_to_64: 2,
        composition_ratio_of_people_aged_15_to_64: 2,
        number_of_people_aged_65_and_over: 2,
        composition_ratio_of_people_aged_65_and_over: 2,
        akiya_result_cleaned_flag: true,
        closing_flag_suido_residence: true,
        gender_ratio: 2,
        maximum_water_usage_suido_residence: 2,
        period_of_residence: 2,
        predicted_label: "2",
        predicted_probability: 2,
        registration_date_touki_residence: new Date(),
        structure_name_touki_residence: "2",
        geometry: {},
      },
    ],
    [],
  );

  const memotizedPieChart = useMemo(() => {
    return (
      <PieChart<data_set_detail_buildings>
        column={{
          key: "number_of_people_in_household",
          type: "number",
          label: "世帯人数",
        }}
        data={demo}
        keyColumn={{
          key: "address",
          type: "string",
          label: "住所",
        }}
      />
    );
  }, [demo]);

  return (
    <div>
      <h1>About</h1>
      <div>
        {memotizedPieChart}
        <a href="#">Go to home page</a>
      </div>
    </div>
  );
}
