import { useMemo } from "react";
import { PieChart } from "../../components/pie-charts";
import { type DataSetDetailBuidlings } from "../../@types/analysis";

export function About(): JSX.Element {
  const demo: DataSetDetailBuidlings[] = useMemo(
    () => [
      {
        id: 1,
        data_set_result_id: 1,
        created_at: "2021-09-01 00:00:00",
        updated_at: "2021-09-01 00:00:00",
      },
    ],
    [],
  );

  const memotizedPieChart = useMemo(() => {
    return (
      <PieChart<DataSetDetailBuidlings>
        column={{
          key: "id",
          type: "number",
          label: "世帯人数",
        }}
        data={demo}
        keyColumn={{
          key: "data_set_result_id",
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
