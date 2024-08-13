import { useMemo } from "react";
import { PieChart } from "../../components/pie-charts";
import { type DataSetDetailBuidlings } from "../../@types/analysis";
import { BarChart } from "../../components/bar-charts";
import { LineChart } from "../../components/line-charts";

export function About(): JSX.Element {
  const demo: DataSetDetailBuidlings[] = useMemo(
    () => [
      {
        id: 1,
        data_set_result_id: 1,
        created_at: "2021-09-01 00:00:00",
        updated_at: "2021-09-01 00:00:00",
      },
      {
        id: 2,
        data_set_result_id: 2,
        created_at: "2021-09-02 00:00:00",
        updated_at: "2021-09-02 00:00:00",
      },
      {
        id: 3,
        data_set_result_id: 3,
        created_at: "2021-09-03 00:00:00",
        updated_at: "2021-09-03 00:00:00",
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

      {/* FIXME: 以下スタイルは仮のものなので本番では削除 */}
      <div
        style={{
          width: "800px",
        }}
      >
        {memotizedPieChart}
        <BarChart<DataSetDetailBuidlings>
          data={demo}
          xColumn={{
            key: "created_at",
            type: "string",
            label: "世帯人数",
          }}
          yColumn={{
            key: "id",
            type: "number",
            label: "世帯人数",
            unit: "%",
          }}
        />
        <LineChart<DataSetDetailBuidlings>
          data={demo}
          xColumn={{
            key: "created_at",
            type: "string",
            label: "世帯人数",
          }}
          yColumn={{
            key: "id",
            type: "number",
            label: "世帯人数",
            unit: "%",
          }}
        />
        <a href="#">Go to home page</a>
      </div>
    </div>
  );
}
