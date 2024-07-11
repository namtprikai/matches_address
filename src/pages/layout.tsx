import { Outlet } from "react-router-dom";

export function Layout(): JSX.Element {
  return (
    <div id="detail">
      <Outlet />
    </div>
  );
}
