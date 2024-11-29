import {
  Card,
  makeStyles,
  tokens,
  Table,
  TableBody,
} from "@fluentui/react-components";
import { useFetchJobs } from "../../hooks/use-fetch-jobs";
import { TableHeaderJobs } from "../../components/table-header-jobs";
import { TableRowJobs } from "../../components/table-rows-jobs";
import { DebugCreateButtons } from "./_debug-create-buttuns";

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
  table: {
    width: "100%",
  },
  noData: {
    color: "#616161",
    fontSize: tokens.fontSizeBase300,
  },
});

export function Job(): JSX.Element {
  const styles = useStyles();
  const { data } = useFetchJobs();

  const hasData = data && data.length > 0;

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>非同期処理一覧</h2>

      <DebugCreateButtons />

      <Card className={styles.content}>
        {hasData ? (
          <Table className={styles.table}>
            <TableHeaderJobs />
            <TableBody>
              {data.map((item) => (
                <TableRowJobs key={item.id} item={item} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className={styles.noData}>
            現在表示できる非同期処理はありません
          </div>
        )}
      </Card>
    </div>
  );
}
