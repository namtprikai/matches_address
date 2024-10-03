import { Link } from "react-router-dom";
import { makeStyles } from "@fluentui/react-components";
import { Map } from "../../components/map";

const useStyles = makeStyles({
  flex: {
    display: "flex",
    flexDirection: "column",
  },
});

export function Debug(): JSX.Element {
  const styles = useStyles();
  return (
    <div>
      <h1>(開発用)</h1>
      <div className={styles.flex}>
        <a href="#">Go to home page</a>
        <Link to="/normalization">Go to normalization page</Link>
      </div>
      <Map areas={[]} dataSetResultId={1} type="building" />
    </div>
  );
}
