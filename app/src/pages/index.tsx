import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import {
  FluentProvider,
  createLightTheme,
  type BrandVariants,
} from "@fluentui/react-components";
import { Error } from "./error";
import { Debug } from "./debug";
import { Normalization } from "./normalization";
import { Layout } from "./layout";
import "../styles/global.css";
import { Workbook } from "./analysis/workbook";
import { EditWorkbook } from "./analysis/workbook/edit";
import { DetailWorkbook } from "./analysis/workbook/detail";
import { Dataset } from "./dataset";
import { LayoutWithoutPadding } from "./layoutWithoutPadding";
import { Model } from "./model";
import { Job } from "./job";
import { JobDetail } from "./job/detail";
import { ModelCreate } from "./model/create";
import { JobPreview } from "./job/detail/preview";

// クライアントだけで動作するアプリケーションのため`createHashRouter`を使用する
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Navigate to="analysis/workbook" />,
      },
      {
        path: "*",
        element: <>404 Not Found</>,
      },
      {
        path: "model",
        element: <Model />,
      },
      {
        path: "job",
        element: <Job />,
      },
      {
        path: "job/detail/:id",
        element: <JobDetail />,
      },
      {
        path: "job/preview",
        element: <JobPreview />,
      },
      {
        path: "analysis/workbook",
        element: <Workbook />,
        index: true,
      },
      {
        path: "analysis/workbook/:id",
        element: <DetailWorkbook />,
      },
      {
        path: "dataset",
        element: <Dataset />,
      },
      {
        path: "debug",
        element: <Debug />,
      },
      {
        path: "model/create",
        element: <ModelCreate />,
      },
    ],
  },
  {
    path: "/",
    element: <LayoutWithoutPadding />,
    errorElement: <Error />,
    children: [
      {
        path: "analysis/workbook/:id/edit",
        element: <EditWorkbook />,
      },
      {
        path: "normalization",
        element: <Normalization />,
      },
    ],
  },
]);

const myNewTheme: BrandVariants = {
  10: "#020204",
  20: "#16151E",
  30: "#232235",
  40: "#2D2D48",
  50: "#39395B",
  60: "#444570",
  70: "#505185",
  80: "#5B5D9B",
  90: "#696AAB",
  100: "#7979B4",
  110: "#8887BD",
  120: "#9796C5",
  130: "#A7A5CE",
  140: "#B6B4D7",
  150: "#C6C4DF",
  160: "#D5D4E8",
};

const theme = createLightTheme(myNewTheme);

export function App(): JSX.Element {
  return (
    <FluentProvider theme={theme}>
      <RouterProvider router={router} />
    </FluentProvider>
  );
}
