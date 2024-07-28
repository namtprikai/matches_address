import {
  makeStyles,
  tokens
} from "@fluentui/react-components";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

const useStyles = makeStyles({
  root: {
    overflow: "hidden",
    display: "flex",
  },
  content: {
    flex: "1",
    padding: tokens.spacingVerticalL,
    display: "grid",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
});

export function Layout(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}