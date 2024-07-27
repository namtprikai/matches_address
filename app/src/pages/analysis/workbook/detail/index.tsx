import { makeStyles } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/Button";

const useStyles = makeStyles({
    root: {
    },
  });

export function DetailWorkbook(): JSX.Element {
    const styles = useStyles();

    const { id } = useParams();

    return (
      <div className={styles.root}>
        <h2>詳細: {id}</h2>

        <div>
            <a href={`#analysis/workbook/${id}/edit`}><Button>編集</Button></a>
        </div>
      </div>
    );
  }
  