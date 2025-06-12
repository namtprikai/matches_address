import { type View } from "../../bi-modules/interfaces/view";
import { ViewTable } from "./view-table";
import { ViewBar } from "./view-bar";
import { ViewLine } from "./view-line";
import { ViewPie } from "./view-pie";
import { Map } from "./view-map";
import { ViewMapWithTable } from "./view-map-with-table";

type Props = {
  view: View;
};

/** ビューの分岐をするコンポーネント */
export const ViewStyle = ({ view }: Props): JSX.Element => {
  const { style, unit } = view;

  switch (true) {
    case style === "pie" && unit === "building":
      return <ViewPie view={view} />;
    case style === "bar" && unit === "area":
      return <ViewBar view={view} />;
    case style === "line" && unit === "building":
      return <ViewLine view={view} />;
    case style === "table": {
      return <ViewTable view={view} />;
    }
    case style === "map": {
      return <Map view={view} />;
    }
    case style === "map-with-table": {
      return <ViewMapWithTable view={view} />;
    }
  }

  return <>未設定</>;
};
