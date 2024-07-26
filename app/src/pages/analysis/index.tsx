import {
  AddFilled
} from "@fluentui/react-icons";
import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { Button } from "../../components/Button";

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
    minHeight: "300px"
  }
});

export function Analysis(): JSX.Element {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>分析</h2>

      <Card className={styles.content}>
        <Button icon={<AddFilled />} onClick={():void=>alert("create")}>新規ワークブック作成</Button>
      </Card>
    </div>
  );
}
