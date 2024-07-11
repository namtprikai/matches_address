import { createHashRouter } from "react-router-dom";
import { Home } from "./home";
import { Error } from "./error";
import { About } from "./about";
import { Layout } from "./layout";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
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
