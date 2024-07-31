import { MapComponent } from "./map-component";

export function Map(): JSX.Element {
  return (
    <div>
      <div>
        <div>
          <div>空き家率</div>
          <div>
            <button>✅0~30%</button>
            <button>✅30~80%</button>
            <button>✅80%~</button>
          </div>
        </div>
        <div>
          <div>表示期間</div>
          <div>ドロップダウン</div>
        </div>
      </div>
      <MapComponent />
    </div>
  );
}
