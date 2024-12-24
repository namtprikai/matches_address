import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { ButtonCreateModel } from "../../components/button-create-model";
import { TableModel } from "../../components/table-model";
import { Button } from "../../components/ui/button";
import { TableJobsByType } from "../../components/table-jobs-by-type";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  content: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    minHeight: "300px",
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    gap: tokens.spacingVerticalXL,
  },
});

export function Model(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>モデル構築</h2>

      <Card className={styles.content}>
        <ButtonCreateModel />

        <TableModel />

        <h4>処理一覧</h4>
        <TableJobsByType jobType="ml" />
      </Card>

      <div>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugInsertModelFiles")
              .catch(console.error);
          }}
          size="small"
        >
          作成(debug)
        </Button>
      </div>
    </div>
  );
}
