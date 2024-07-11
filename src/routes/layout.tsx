import { Outlet } from "react-router-dom";
import "./index.css";

export function Layout(): JSX.Element {
  return (
    <div id="detail">
      <Outlet />
    </div>
  );
}
