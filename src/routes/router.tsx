import { createHashRouter } from "react-router-dom";
import { Home } from "./home";
import { ErrorPage } from "./error-page";
import { About } from "./about";
import { Root } from "./root";

export const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
]);
