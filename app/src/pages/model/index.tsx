import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { ButtonCreateModel } from "../../components/button-create-model";
import { DialogImportDataset } from "../../components/dialog-import-dataset";
import { TableModel } from "../../components/table-model";

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
      <h2 className={styles.heading}>モデル管理</h2>

      <Card className={styles.content}>
        <ButtonCreateModel />
        <DialogImportDataset />
        <TableModel />
      </Card>
    </div>
  );
}
