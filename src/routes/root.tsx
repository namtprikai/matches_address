import { Outlet } from "react-router-dom";
import "./global.css";

export function Root(): JSX.Element {
  return (
    <div id="detail">
      <Outlet />
    </div>
  );
}
