import { makeStyles } from "@fluentui/react-components";
import { useParams } from "react-router-dom";
import { Button } from "../../../../components/Button";

const useStyles = makeStyles({
    root: {
    },
  });

export function EditWorkbook(): JSX.Element {
    const styles = useStyles();

    const { id } = useParams();

    return (
      <div className={styles.root}>
        <h2>編集: {id}</h2>
        <div>
            <a href={`#analysis/workbook/${id}`}><Button>詳細に戻る</Button></a>
        </div>
      </div>
    );
  }
  