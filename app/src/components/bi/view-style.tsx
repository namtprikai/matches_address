import { type View } from "../../bi-modules/interfaces/view";
import { ViewTable } from "./view-table";
import { ViewBar } from "./view-bar";
import { ViewLine } from "./view-line";
import { ViewPie } from "./view-pie";
import { ViewMapWithTable } from "./view-map-with-table";

type Props = {
  view: View;
  isPreview?: boolean;
};

/** ビューの分岐をするコンポーネント */
export const ViewStyle = ({ view, ...props }: Props): JSX.Element => {
  const { style, unit } = view;

  switch (true) {
    case style === "pie" && unit === "building":
      return <ViewPie view={view} {...props} />;
    case style === "bar" && unit === "area":
      return <ViewBar view={view} {...props} />;
    case style === "line" && unit === "building":
      return <ViewLine view={view} {...props} />;
    case style === "table": {
      return <ViewTable view={view} {...props} />;
    }
    case style === "map-with-table": {
      return <ViewMapWithTable view={view} {...props} />;
    }
  }

  return <>未設定</>;
};
