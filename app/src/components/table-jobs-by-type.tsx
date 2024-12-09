import {
  Table,
  TableBody,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useFetchJobs } from "../hooks/use-fetch-jobs";
import { type SelectJob } from "../schema";
import { TableHeaderJobs } from "./table-header-jobs";
import { TableRowJobs } from "./table-rows-jobs";

const useStyles = makeStyles({
  notFound: {
    fontSize: "14px",
  },
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

type Props = {
  jobType: SelectJob["type"];
};

export const TableJobsByType = ({ jobType }: Props): JSX.Element => {
  const styles = useStyles();

  const { data } = useFetchJobs(undefined, jobType);

  if (data === undefined) return <></>;

  if (data.length === 0) {
    return <p className={styles.notFound}>現在実行中の処理はありません</p>;
  }

  return (
    <Table className={styles.table}>
      <TableHeaderJobs />
      <TableBody>
        {data.map((item) => (
          <TableRowJobs key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
};
