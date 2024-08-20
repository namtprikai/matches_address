import { Map } from "../../components/map";
import { _dummyBuildingData } from "../../components/map/_dummy-data";

export function Home(): JSX.Element {
  return (
    <div>
      <h1>ホーム</h1>
      <Map data={_dummyBuildingData} />
    </div>
  );
}
