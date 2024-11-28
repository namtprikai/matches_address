import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { AddFilled } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { TableNormalizationJobs } from "../../components/table-normalization-jobs";

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

export function Normalization(): JSX.Element {
  const styles = useStyles();
  const navigator = useNavigate();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>正規化処理</h2>

      <Card className={styles.content}>
        <Button
          icon={
            <AddFilled
              color={tokens.colorNeutralForeground1}
              fontSize={tokens.fontSizeBase400}
              strokeWidth={2}
            />
          }
          onClick={() => {
            navigator("/normalization/create");
          }}
          size="small"
        >
          正規化処理を始める
        </Button>

        <h4>実行中の処理</h4>
        <TableNormalizationJobs />
      </Card>
    </div>
  );
}
