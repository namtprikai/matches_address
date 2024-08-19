// import { Map } from "../../components/map";
// import { _dummyBuildingData } from "../../components/map/_dummy-data";
import { MapComponent2 } from "../../components/map/map-component2";

export function Home(): JSX.Element {
  return (
    <div>
      <h1>ホーム</h1>
      {/* <Map data={_dummyBuildingData} /> */}
      <MapComponent2 />
    </div>
  );
}
