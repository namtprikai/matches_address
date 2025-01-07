import {
  Card,
  makeStyles,
  tokens,
  Table,
  TableBody,
} from "@fluentui/react-components";
import { useFetchJobsWithPagination } from "../../hooks/use-fetch-jobs-with-pagination";
import { TableHeaderJobs } from "../../components/table-header-jobs";
import { TableRowJobs } from "../../components/table-rows-jobs";
import { BreadcrumbBase, BreadcrumbItem } from "../../components/ui/breadcrumb";
import { ROUTES } from "../../routes";
import { Pagination } from "../../components/ui/pagination";
import { usePagination } from "../../hooks/use-pagination";
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
  paginationWrapper: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
  },
});

export function Job(): JSX.Element {
  const styles = useStyles();
  const pagination = usePagination(50);
  const { data } = useFetchJobsWithPagination({
    page: pagination.page,
    limitPerPage: pagination.limitPerPage,
  });

  const hasData = data && data.length > 0;

  return (
    <div className={styles.root}>
      <BreadcrumbBase
        breadcrumbItem={[
          {
            children: "処理一覧",
            current: true,
            href: ROUTES.JOB.ROOT,
          },
        ].map((item) => (
          <BreadcrumbItem key={item.href} {...item} />
        ))}
      />
      <h2 className={styles.heading}>処理一覧</h2>

      <Card className={styles.content}>
        <div className={styles.paginationWrapper}>
          <Pagination {...pagination} />
        </div>
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
          <div className={styles.noData}>現在表示できる処理はありません</div>
        )}
      </Card>

      <DebugCreateButtons />
    </div>
  );
}
