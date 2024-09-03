import { Map } from "../../components/map";
import { _dummyBuildingData } from "../../components/map/_dummy-data";

export function About(): JSX.Element {
  return (
    <div>
      <h1>(開発用)</h1>
      <a href="#">Go to home page</a>
      <Map data={_dummyBuildingData} />
    </div>
  );
}
