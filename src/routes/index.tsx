import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
