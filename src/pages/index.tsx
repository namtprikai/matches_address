import { createHashRouter, RouterProvider } from "react-router-dom";
import { Home } from "./home";
import { Error } from "./error";
import { About } from "./about";
import { Layout } from "./layout";
import "./index.css";

const router = createHashRouter([
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

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
