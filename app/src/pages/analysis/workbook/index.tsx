import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { ButtonCreateWorkbook } from "../../../components/button-create-workbook";
import { TableWorkbook } from "../../../components/table-workbook";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalL,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  content: {
    display: "block",
    minHeight: "300px",
  },
});

export function Workbook(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>分析</h2>

      <Card className={styles.content}>
        <ButtonCreateWorkbook />
        <TableWorkbook />
      </Card>
    </div>
  );
}
