import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { AddFilled } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
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

export function JobEvaluation(): JSX.Element {
  const styles = useStyles();
  const navigator = useNavigate();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>空き家判定</h2>

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
            navigator("/evaluation/create");
          }}
          size="small"
        >
          空き家判定を始める
        </Button>

        <h4>処理一覧</h4>
        <TableJobsByType jobType="result" />
      </Card>
    </div>
  );
}
